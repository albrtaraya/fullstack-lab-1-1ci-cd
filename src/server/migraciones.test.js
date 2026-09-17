// @vitest-environment node

import { describe, it, expect, vi } from 'vitest';
import { aplicarMigraciones, listarMigraciones } from './migraciones.js';
import { sembrar, TAREAS_DE_EJEMPLO } from './semilla.js';

/**
 * PostgreSQL simulado: guarda las sentencias ejecutadas y permite fijar qué
 * migraciones figuran ya como aplicadas. Así se puede verificar el orden y la
 * idempotencia sin levantar una base de datos.
 */
function poolFalso({ yaAplicadas = [], fallarEn = null } = {}) {
	const sentencias = [];
	const query = vi.fn(async (sql, parametros) => {
		sentencias.push({ sql, parametros });

		if (fallarEn && typeof sql === 'string' && sql.includes(fallarEn)) {
			throw new Error('sintaxis invalida');
		}
		if (typeof sql === 'string' && sql.includes('SELECT nombre FROM migracion_aplicada')) {
			return { rows: yaAplicadas.map((nombre) => ({ nombre })) };
		}
		return { rows: [] };
	});

	return { query, sentencias };
}

describe('listarMigraciones', () => {
	it('devuelve los archivos .sql en orden por su prefijo numerico', async () => {
		const archivos = await listarMigraciones();

		expect(archivos).toEqual(['001_crear_tabla_tarea.sql', '002_indice_completada.sql']);
	});
});

describe('aplicarMigraciones', () => {
	it('aplica todas las migraciones en una base nueva', async () => {
		const pool = poolFalso();

		const { aplicadas, omitidas } = await aplicarMigraciones(pool);

		expect(aplicadas).toEqual(['001_crear_tabla_tarea.sql', '002_indice_completada.sql']);
		expect(omitidas).toEqual([]);
	});

	it('crea la tabla de control antes que nada', async () => {
		const pool = poolFalso();

		await aplicarMigraciones(pool);

		expect(pool.sentencias[0].sql).toContain('CREATE TABLE IF NOT EXISTS migracion_aplicada');
	});

	it('no repite las migraciones ya aplicadas', async () => {
		const pool = poolFalso({ yaAplicadas: ['001_crear_tabla_tarea.sql'] });

		const { aplicadas, omitidas } = await aplicarMigraciones(pool);

		expect(aplicadas).toEqual(['002_indice_completada.sql']);
		expect(omitidas).toEqual(['001_crear_tabla_tarea.sql']);
	});

	it('correrlo dos veces no aplica nada la segunda vez', async () => {
		const pool = poolFalso({
			yaAplicadas: ['001_crear_tabla_tarea.sql', '002_indice_completada.sql'],
		});

		const { aplicadas } = await aplicarMigraciones(pool);

		expect(aplicadas).toEqual([]);
	});

	it('registra cada migracion aplicada en la tabla de control', async () => {
		const pool = poolFalso();

		await aplicarMigraciones(pool);

		const inserciones = pool.sentencias.filter(
			(s) => typeof s.sql === 'string' && s.sql.includes('INSERT INTO migracion_aplicada'),
		);
		expect(inserciones.map((s) => s.parametros[0])).toEqual([
			'001_crear_tabla_tarea.sql',
			'002_indice_completada.sql',
		]);
	});

	it('cada migracion corre dentro de una transaccion', async () => {
		const pool = poolFalso();

		await aplicarMigraciones(pool);

		const sqls = pool.sentencias.map((s) => s.sql);
		expect(sqls.filter((s) => s === 'BEGIN')).toHaveLength(2);
		expect(sqls.filter((s) => s === 'COMMIT')).toHaveLength(2);
	});

	it('si una migracion falla hace ROLLBACK y no la marca como aplicada', async () => {
		const pool = poolFalso({ fallarEn: 'CREATE TABLE IF NOT EXISTS tarea' });

		await expect(aplicarMigraciones(pool)).rejects.toThrow('001_crear_tabla_tarea.sql');

		const sqls = pool.sentencias.map((s) => s.sql);
		expect(sqls).toContain('ROLLBACK');
		expect(sqls).not.toContain('COMMIT');
	});
});

describe('sembrar', () => {
	it('usa ON CONFLICT DO UPDATE en vez de un INSERT simple', async () => {
		const pool = poolFalso();

		await sembrar(pool);

		const inserciones = pool.sentencias.filter(
			(s) => typeof s.sql === 'string' && s.sql.includes('INSERT INTO tarea'),
		);
		expect(inserciones).toHaveLength(TAREAS_DE_EJEMPLO.length);
		// Esta es la cláusula que hace el seed repetible: sin ella, la segunda
		// corrida fallaría con "duplicate key value violates unique constraint".
		expect(inserciones[0].sql).toContain('ON CONFLICT (id) DO UPDATE');
	});

	it('reajusta la secuencia de ids despues de sembrar', async () => {
		const pool = poolFalso();

		await sembrar(pool);

		const ultima = pool.sentencias.at(-1).sql;
		expect(ultima).toContain("setval('tarea_id_seq'");
	});

	it('siembra la misma cantidad sin importar cuantas veces se ejecute', async () => {
		const pool = poolFalso();

		const primera = await sembrar(pool);
		const segunda = await sembrar(pool);

		expect(primera.sembradas).toBe(TAREAS_DE_EJEMPLO.length);
		expect(segunda.sembradas).toBe(TAREAS_DE_EJEMPLO.length);
	});
});
