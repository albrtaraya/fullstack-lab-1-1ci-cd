/**
 * Comandos de base de datos.
 *
 *   npm run db:migrate   aplica las migraciones pendientes
 *   npm run db:seed      carga los datos de ejemplo
 *
 * Son los equivalentes de `prisma migrate deploy` y `prisma db seed` para este
 * proyecto, que no usa Prisma. Ambos son idempotentes: correrlos dos veces
 * seguidas no duplica nada.
 */

import pg from 'pg';
import { aplicarMigraciones } from './migraciones.js';
import { sembrar } from './semilla.js';

const comando = process.argv[2];
const urlConexion = process.env.DATABASE_URL;

if (!urlConexion) {
	console.error('Falta DATABASE_URL. Ejemplo:');
	console.error('  DATABASE_URL=postgresql://appuser:apppass@localhost:5434/appdb npm run db:migrate');
	process.exit(1);
}

const pool = new pg.Pool({ connectionString: urlConexion });

try {
	if (comando === 'migrate') {
		const { aplicadas, omitidas } = await aplicarMigraciones(pool);
		for (const nombre of omitidas) {
			console.log(`ya aplicada  ${nombre}`);
		}
		for (const nombre of aplicadas) {
			console.log(`APLICADA     ${nombre}`);
		}
		console.log(`\nMigraciones: ${aplicadas.length} aplicadas, ${omitidas.length} ya estaban.`);
	} else if (comando === 'seed') {
		const { sembradas } = await sembrar(pool);
		const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM tarea');
		console.log(`Seed: ${sembradas} tareas de ejemplo.`);
		console.log(`Total de filas en la tabla tarea: ${rows[0].total}`);
	} else {
		console.error(`Comando desconocido: ${comando}. Use "migrate" o "seed".`);
		process.exit(1);
	}
} catch (error) {
	console.error(error.message);
	process.exit(1);
} finally {
	await pool.end();
}
