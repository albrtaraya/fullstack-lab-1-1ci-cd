import express from 'express';
import { esTituloValido, normalizarTitulo } from '../utils/validaciones.js';

/**
 * API de tareas.
 *
 * La instancia de Express se exporta SIN llamar a `app.listen()`, para que
 * Supertest pueda levantarla en un puerto efímero durante las pruebas sin
 * ocupar un puerto real.
 */
const app = express();
app.use(express.json());

/** Almacén en memoria. Suficiente para el alcance de este laboratorio. */
const tareas = [];
let siguienteId = 1;

app.get('/tareas', (req, res) => {
	res.status(200).json(tareas);
});

app.post('/tareas', (req, res) => {
	const { titulo } = req.body ?? {};

	if (!esTituloValido(titulo)) {
		return res.status(400).json({ error: 'El titulo es obligatorio' });
	}

	const nuevaTarea = { id: siguienteId++, titulo: normalizarTitulo(titulo), completada: false };
	tareas.push(nuevaTarea);
	res.status(201).json(nuevaTarea);
});

export default app;
