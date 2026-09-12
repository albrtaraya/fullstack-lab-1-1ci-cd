import { useState } from 'react';
import { esTituloValido, normalizarTitulo } from '../utils/validaciones.js';

/**
 * Formulario para agregar una tarea nueva a la lista.
 *
 * Reutiliza las validaciones puras de `src/utils/validaciones.js`, de modo que
 * la regla de "un título no puede ser solo espacios en blanco" vive en un único
 * lugar y se comporta igual en el formulario y en la API.
 */
export default function FormularioTarea({ onAgregar }) {
	const [titulo, setTitulo] = useState('');

	function manejarEnvio(e) {
		e.preventDefault();
		if (esTituloValido(titulo)) {
			onAgregar(normalizarTitulo(titulo));
			setTitulo('');
		}
	}

	return (
		<form onSubmit={manejarEnvio}>
			<label htmlFor="titulo-tarea">Nueva tarea</label>
			<input id="titulo-tarea" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
			<button type="submit">Agregar</button>
		</form>
	);
}
