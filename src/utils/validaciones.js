/**
 * Funciones puras de validación y cálculo.
 *
 * Su resultado depende únicamente de los parámetros de entrada: no consultan la
 * base de datos, no modifican variables externas ni hacen peticiones de red.
 * Eso las hace directamente testeables sin ningún tipo de simulación.
 */

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Indica si una cadena tiene formato de correo electrónico válido.
 * @param {string} correo
 * @returns {boolean}
 */
export function esCorreoValido(correo) {
	if (typeof correo !== 'string') {
		return false;
	}
	return REGEX_CORREO.test(correo.trim());
}

/**
 * Cuenta cuántas tareas de la lista siguen pendientes.
 * @param {Array<{completada?: boolean}>} tareas
 * @returns {number}
 */
export function contarTareasPendientes(tareas) {
	if (!Array.isArray(tareas)) {
		return 0;
	}
	return tareas.filter((t) => !t.completada).length;
}

/**
 * Normaliza el título de una tarea recortando los espacios sobrantes.
 * @param {string} titulo
 * @returns {string}
 */
export function normalizarTitulo(titulo) {
	if (typeof titulo !== 'string') {
		return '';
	}
	return titulo.trim().replace(/\s+/g, ' ');
}

/**
 * Indica si un título de tarea es aceptable: debe tener contenido real,
 * no solamente espacios en blanco.
 * @param {string} titulo
 * @returns {boolean}
 */
export function esTituloValido(titulo) {
	return normalizarTitulo(titulo).length > 0;
}
