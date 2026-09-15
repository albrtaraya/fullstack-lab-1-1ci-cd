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
		 * Crea la tabla si no existe. El proyecto no usa Prisma, así que este es
		 * el equivalente a `prisma migrate deploy` de la guía.
		 */
		async inicializar() {
			const pool = await obtenerPool();
			await pool.query(`
				CREATE TABLE IF NOT EXISTS tarea (
					id SERIAL PRIMARY KEY,
					titulo TEXT NOT NULL,
					completada BOOLEAN NOT NULL DEFAULT FALSE,
					creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
				)
			`);
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
