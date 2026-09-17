import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Aplicador de migraciones.
 *
 * El proyecto no usa Prisma, así que este módulo cumple el papel de
 * `prisma migrate deploy`: aplica en orden los archivos .sql de
 * `db/migraciones/` y lleva registro de cuáles ya se ejecutaron, de modo que
 * volver a correrlo no repite trabajo ni falla.
 */

const AQUI = dirname(fileURLToPath(import.meta.url));
export const CARPETA_MIGRACIONES = join(AQUI, '..', '..', 'db', 'migraciones');

/** Tabla de control: qué migraciones ya se aplicaron y cuándo. */
const TABLA_CONTROL = `
	CREATE TABLE IF NOT EXISTS migracion_aplicada (
		nombre TEXT PRIMARY KEY,
		aplicada_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)
`;

/**
 * Devuelve los nombres de los archivos de migración, ordenados.
 * El prefijo numérico (001_, 002_…) define el orden de aplicación.
 */
export async function listarMigraciones(carpeta = CARPETA_MIGRACIONES) {
	const archivos = await readdir(carpeta);
	return archivos.filter((a) => a.endsWith('.sql')).sort();
}

/**
 * Aplica las migraciones pendientes.
 *
 * Cada migración corre dentro de su propia transacción junto con el registro
 * en la tabla de control: si el SQL falla, no queda marcada como aplicada.
 *
 * @param {{query: Function, connect?: Function}} pool cliente de PostgreSQL
 * @returns {Promise<{aplicadas: string[], omitidas: string[]}>}
 */
export async function aplicarMigraciones(pool, carpeta = CARPETA_MIGRACIONES) {
	await pool.query(TABLA_CONTROL);

	const { rows } = await pool.query('SELECT nombre FROM migracion_aplicada');
	const yaAplicadas = new Set(rows.map((r) => r.nombre));

	const aplicadas = [];
	const omitidas = [];

	for (const nombre of await listarMigraciones(carpeta)) {
		if (yaAplicadas.has(nombre)) {
			omitidas.push(nombre);
			continue;
		}

		const sql = await readFile(join(carpeta, nombre), 'utf8');

		await pool.query('BEGIN');
		try {
			await pool.query(sql);
			await pool.query('INSERT INTO migracion_aplicada (nombre) VALUES ($1)', [nombre]);
			await pool.query('COMMIT');
			aplicadas.push(nombre);
		} catch (error) {
			await pool.query('ROLLBACK');
			throw new Error(`Fallo la migracion ${nombre}: ${error.message}`, { cause: error });
		}
	}

	return { aplicadas, omitidas };
}
