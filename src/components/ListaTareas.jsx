import { useEffect, useState } from 'react';
import FormularioTarea from './FormularioTarea.jsx';
import { contarTareasPendientes } from '../utils/validaciones.js';

/** URL de la API. Se inyecta en tiempo de build (ver Dockerfile.frontend). */
const API = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * Lista de tareas de la página principal.
 *
 * Intenta usar la API de tareas para que los datos persistan en PostgreSQL.
 * Si la API no está disponible —por ejemplo al abrir el sitio suelto, sin el
 * backend levantado— la lista sigue funcionando en memoria: el usuario no se
 * queda con una pantalla rota, y las pruebas automatizadas pueden ejercitar el
 * componente sin necesidad de un servidor.
 */
export default function ListaTareas() {
	const [tareas, setTareas] = useState([]);
	const [conApi, setConApi] = useState(false);

	useEffect(() => {
		let cancelado = false;

		async function cargar() {
			try {
				const respuesta = await fetch(`${API}/tareas`);
				if (!respuesta.ok) throw new Error('respuesta no válida');
				const datos = await respuesta.json();
				if (!cancelado) {
					setTareas(datos);
					setConApi(true);
				}
			} catch {
				// La API no responde: se sigue en modo local.
				if (!cancelado) setConApi(false);
			}
		}

		cargar();
		return () => {
			cancelado = true;
		};
	}, []);

	async function agregarTarea(titulo) {
		if (conApi) {
			try {
				const respuesta = await fetch(`${API}/tareas`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ titulo }),
				});
				if (respuesta.ok) {
					const creada = await respuesta.json();
					setTareas((actuales) => [...actuales, creada]);
					return;
				}
			} catch {
				// Se cayó la API a mitad de sesión: se continúa en memoria.
			}
		}
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
			{tareas.length === 0 ? (
				<p>Todavía no hay tareas. Escribe la primera aquí arriba.</p>
			) : (
				<ul>
					{tareas.map((tarea, i) => (
						<li key={tarea.id ?? `${tarea.titulo}-${i}`}>
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
			)}
		</section>
	);
}
