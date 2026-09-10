import { useState } from 'react';
import FormularioTarea from './FormularioTarea.jsx';
import { contarTareasPendientes } from '../utils/validaciones.js';

/**
 * Lista de tareas de la página principal.
 *
 * Mantiene el estado en memoria y delega el alta de tareas en `FormularioTarea`
 * y el conteo de pendientes en la función pura `contarTareasPendientes`.
 */
export default function ListaTareas() {
	const [tareas, setTareas] = useState([]);

	function agregarTarea(titulo) {
		setTareas((actuales) => [...actuales, { titulo, completada: false }]);
	}

	function alternarTarea(indice) {
		setTareas((actuales) =>
			actuales.map((tarea, i) =>
				i === indice ? { ...tarea, completada: !tarea.completada } : tarea,
			),
		);
	}

	const pendientes = contarTareasPendientes(tareas);

	return (
		<section>
			<h2>Mis tareas</h2>
			<FormularioTarea onAgregar={agregarTarea} />
			<p>
				{pendientes} {pendientes === 1 ? 'tarea pendiente' : 'tareas pendientes'}
			</p>
			<ul>
				{tareas.map((tarea, i) => (
					<li key={`${tarea.titulo}-${i}`}>
						<label>
							<input
								type="checkbox"
								checked={tarea.completada}
								onChange={() => alternarTarea(i)}
							/>
							{tarea.titulo}
						</label>
					</li>
				))}
			</ul>
		</section>
	);
}
