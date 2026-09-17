/**
 * Repositorio de tareas.
 *
 * Expone dos implementaciones con la misma interfaz:
 *
 *   - **memoria**: un arreglo en el proceso. Es la que usan las pruebas
 *     automatizadas, de modo que la suite corre sin necesidad de levantar una
 *     base de datos ni en local ni en el pipeline de CI.
 *   - **postgres**: la real, que se activa sola cuando existe `DATABASE_URL`.
 *     Es la que usa el contenedor del backend dentro de Docker Compose.
 *
 * La elección es automática: si hay `DATABASE_URL`, se usa PostgreSQL.
 */

function crearRepositorioEnMemoria() {
	const tareas = [];
	let siguienteId = 1;

	return {
		tipo: 'memoria',

		async inicializar() {},

		async listar() {
			return tareas;
		},

		async crear(titulo) {
			const nuevaTarea = { id: siguienteId++, titulo, completada: false };
			tareas.push(nuevaTarea);
			return nuevaTarea;
		},

		async cerrar() {},
	};
}

function crearRepositorioPostgres(urlConexion) {
	// `pg` se importa de forma perezosa: así la suite de pruebas, que siempre
	// usa el almacén en memoria, nunca carga el driver ni sus dependencias.
	let pool;

	async function obtenerPool() {
		if (!pool) {
			const { default: pg } = await import('pg');
			pool = new pg.Pool({ connectionString: urlConexion });
		}
		return pool;
	}

	return {
		tipo: 'postgres',

		/**
		 * Aplica las migraciones pendientes al arrancar.
		 *
		 * El esquema ya no se define aquí: vive en los archivos .sql de
		 * `db/migraciones/`, que son los que versiona Git y los que aplica el
		 * pipeline. Este módulo solo los invoca.
		 */
		async inicializar() {
			const pool = await obtenerPool();
			const { aplicarMigraciones } = await import('./migraciones.js');
			return aplicarMigraciones(pool);
		},

		async listar() {
			const pool = await obtenerPool();
			const { rows } = await pool.query(
				'SELECT id, titulo, completada FROM tarea ORDER BY id',
			);
			return rows;
		},

		async crear(titulo) {
			const pool = await obtenerPool();
			const { rows } = await pool.query(
				'INSERT INTO tarea (titulo) VALUES ($1) RETURNING id, titulo, completada',
				[titulo],
			);
			return rows[0];
		},

		async cerrar() {
			if (pool) {
				await pool.end();
			}
		},
	};
}

export function crearRepositorio(urlConexion = process.env.DATABASE_URL) {
	return urlConexion ? crearRepositorioPostgres(urlConexion) : crearRepositorioEnMemoria();
}
