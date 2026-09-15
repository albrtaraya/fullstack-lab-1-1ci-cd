import express from 'express';
import cors from 'cors';
import { esTituloValido, normalizarTitulo } from '../utils/validaciones.js';
import { crearRepositorio } from './repositorio.js';

/**
 * API de tareas.
 *
 * La instancia de Express se exporta SIN llamar a `app.listen()`, para que
 * Supertest pueda levantarla en un puerto efímero durante las pruebas sin
 * ocupar un puerto real. El arranque real vive en `index.js`.
 *
 * El repositorio se resuelve solo: PostgreSQL si hay `DATABASE_URL`, y un
 * almacén en memoria en caso contrario.
 */
export function crearApp(repositorio = crearRepositorio()) {
	const app = express();

	// El frontend se sirve desde nginx en otro puerto (5173) y llama a esta API
	// en el 4000, así que el navegador necesita CORS habilitado.
	app.use(cors());
	app.use(express.json());

	app.locals.repositorio = repositorio;

	/** Sonda de salud: la usa el healthcheck del contenedor. */
	app.get('/salud', (req, res) => {
		res.status(200).json({ estado: 'ok', almacen: repositorio.tipo });
	});

	app.get('/tareas', async (req, res, next) => {
		try {
			res.status(200).json(await repositorio.listar());
		} catch (error) {
			next(error);
		}
	});

	app.post('/tareas', async (req, res, next) => {
		const { titulo } = req.body ?? {};

		if (!esTituloValido(titulo)) {
			return res.status(400).json({ error: 'El titulo es obligatorio' });
		}

		try {
			res.status(201).json(await repositorio.crear(normalizarTitulo(titulo)));
		} catch (error) {
			next(error);
		}
	});

	return app;
}

export default crearApp();
