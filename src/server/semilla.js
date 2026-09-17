/**
 * Datos de ejemplo (seed).
 *
 * El equivalente al `upsert` de Prisma en SQL plano es
 * `INSERT ... ON CONFLICT (id) DO UPDATE`: si la fila ya existe la actualiza en
 * lugar de fallar o duplicarla. Por eso el seed puede correrse dos veces
 * seguidas sin cambiar el resultado.
 */

export const TAREAS_DE_EJEMPLO = [
	{ id: 1, titulo: 'Tarea de ejemplo para pruebas', completada: false },
	{ id: 2, titulo: 'Revisar el pipeline de CI', completada: false },
	{ id: 3, titulo: 'Leer la guia de la Sesion 6', completada: true },
];

/**
 * Inserta o actualiza las tareas de ejemplo.
 *
 * Tras insertar con ids explícitos hay que reajustar la secuencia de `id`: de
 * lo contrario el siguiente INSERT automático intentaría usar un id ya
 * ocupado y fallaría por clave duplicada.
 *
 * @param {{query: Function}} pool cliente de PostgreSQL
 * @returns {Promise<{sembradas: number}>}
 */
export async function sembrar(pool, tareas = TAREAS_DE_EJEMPLO) {
	for (const { id, titulo, completada } of tareas) {
		await pool.query(
			`INSERT INTO tarea (id, titulo, completada)
			 VALUES ($1, $2, $3)
			 ON CONFLICT (id) DO UPDATE
			 SET titulo = EXCLUDED.titulo, completada = EXCLUDED.completada`,
			[id, titulo, completada],
		);
	}

	await pool.query(
		"SELECT setval('tarea_id_seq', COALESCE((SELECT MAX(id) FROM tarea), 1))",
	);

	return { sembradas: tareas.length };
}
