// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * El driver de PostgreSQL se simula: estas pruebas verifican que el repositorio
 * arma las consultas correctas y traduce bien las respuestas, sin necesitar una
 * base de datos levantada ni en local ni en el pipeline.
 */
const consulta = vi.fn();
const cerrarPool = vi.fn();

vi.mock('pg', () => ({
	default: {
		Pool: class {
			constructor(config) {
				this.config = config;
			}
			query(...args) {
				return consulta(...args);
			}
			end(...args) {
				return cerrarPool(...args);
			}
		},
	},
}));

const { crearRepositorio } = await import('./repositorio.js');

beforeEach(() => {
	consulta.mockReset();
	cerrarPool.mockReset();
});

describe('crearRepositorio', () => {
	it('usa el almacen en memoria cuando no hay cadena de conexion', () => {
		expect(crearRepositorio(undefined).tipo).toBe('memoria');
		expect(crearRepositorio('').tipo).toBe('memoria');
	});

	it('usa PostgreSQL cuando recibe una cadena de conexion', () => {
		expect(crearRepositorio('postgresql://u:p@postgres:5432/db').tipo).toBe('postgres');
	});
});

describe('repositorio en memoria', () => {
	it('arranca vacio', async () => {
		const repo = crearRepositorio(undefined);
		await repo.inicializar();

		expect(await repo.listar()).toEqual([]);
	});

	it('crea tareas con id incremental y sin completar', async () => {
		const repo = crearRepositorio(undefined);

		const primera = await repo.crear('Comprar pan');
		const segunda = await repo.crear('Escribir el informe');

		expect(primera).toEqual({ id: 1, titulo: 'Comprar pan', completada: false });
		expect(segunda).toEqual({ id: 2, titulo: 'Escribir el informe', completada: false });
	});

	it('devuelve las tareas creadas', async () => {
		const repo = crearRepositorio(undefined);
		await repo.crear('Revisar el Pull Request');

		const tareas = await repo.listar();

		expect(tareas).toHaveLength(1);
		expect(tareas[0].titulo).toBe('Revisar el Pull Request');
	});

	it('cerrar no falla', async () => {
		const repo = crearRepositorio(undefined);
		await expect(repo.cerrar()).resolves.toBeUndefined();
	});
});

describe('repositorio PostgreSQL', () => {
	const URL = 'postgresql://appuser:apppass@postgres:5432/appdb';

	it('aplica las migraciones al inicializar', async () => {
		consulta.mockResolvedValue({ rows: [] });
		const repo = crearRepositorio(URL);

		const resultado = await repo.inicializar();

		// El esquema ya no se define aquí: se delega en db/migraciones/.
		const sentencias = consulta.mock.calls.map((c) => c[0]).join('\n');
		expect(sentencias).toContain('CREATE TABLE IF NOT EXISTS migracion_aplicada');
		expect(resultado.aplicadas).toContain('001_crear_tabla_tarea.sql');
	});

	it('lista las tareas ordenadas por id', async () => {
		consulta.mockResolvedValue({
			rows: [{ id: 1, titulo: 'Comprar pan', completada: false }],
		});
		const repo = crearRepositorio(URL);

		const tareas = await repo.listar();

		expect(consulta.mock.calls[0][0]).toContain('ORDER BY id');
		expect(tareas).toEqual([{ id: 1, titulo: 'Comprar pan', completada: false }]);
	});

	it('inserta el titulo como parametro y devuelve la fila creada', async () => {
		consulta.mockResolvedValue({
			rows: [{ id: 7, titulo: 'Escribir el informe', completada: false }],
		});
		const repo = crearRepositorio(URL);

		const creada = await repo.crear('Escribir el informe');

		const [sql, parametros] = consulta.mock.calls[0];
		expect(sql).toContain('INSERT INTO tarea');
		// El título viaja como parámetro, no concatenado: evita inyección SQL.
		expect(sql).toContain('$1');
		expect(parametros).toEqual(['Escribir el informe']);
		expect(creada.id).toBe(7);
	});

	it('reutiliza el mismo pool entre llamadas', async () => {
		consulta.mockResolvedValue({ rows: [] });
		const repo = crearRepositorio(URL);

		await repo.listar();
		await repo.listar();

		expect(consulta).toHaveBeenCalledTimes(2);
	});

	it('cierra el pool si llego a abrirse', async () => {
		consulta.mockResolvedValue({ rows: [] });
		const repo = crearRepositorio(URL);
		await repo.listar();

		await repo.cerrar();

		expect(cerrarPool).toHaveBeenCalledTimes(1);
	});

	it('cerrar no falla si el pool nunca se abrio', async () => {
		const repo = crearRepositorio(URL);

		await expect(repo.cerrar()).resolves.toBeUndefined();
		expect(cerrarPool).not.toHaveBeenCalled();
	});
});
