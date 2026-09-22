// @vitest-environment node

import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { crearApp } from '../src/server/app.js';

/** Repositorio que falla en todas sus operaciones, para simular una base caída. */
function repositorioRoto() {
	const falla = () => Promise.reject(new Error('base de datos no disponible'));
	return { tipo: 'postgres', inicializar: falla, listar: falla, crear: falla, cerrar: falla };
}

describe('Sonda de salud', () => {
	it('GET /salud responde ok e informa el almacen en uso', async () => {
		const app = crearApp({ tipo: 'memoria', listar: async () => [] });

		const res = await request(app).get('/salud');

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ estado: 'ok', almacen: 'memoria' });
	});

	it('GET /health responde lo mismo: es la ruta que consulta Railway', async () => {
		const app = crearApp({ tipo: 'postgres', listar: async () => [] });

		const res = await request(app).get('/health');

		expect(res.status).toBe(200);
		expect(res.body.status).toBe('ok');
		expect(res.body.almacen).toBe('postgres');
	});
});

describe('API de tareas con la base de datos caida', () => {
	it('GET /tareas responde 500 en lugar de colgarse', async () => {
		const res = await request(crearApp(repositorioRoto())).get('/tareas');

		expect(res.status).toBe(500);
	});

	it('POST /tareas responde 500 en lugar de colgarse', async () => {
		const res = await request(crearApp(repositorioRoto()))
			.post('/tareas')
			.send({ titulo: 'Tarea valida' });

		expect(res.status).toBe(500);
	});

	it('la validacion del titulo ocurre antes de tocar la base', async () => {
		// Con la base caída, un título vacío sigue devolviendo 400 y no 500:
		// la regla de negocio no depende de la disponibilidad del almacén.
		const res = await request(crearApp(repositorioRoto())).post('/tareas').send({ titulo: '' });

		expect(res.status).toBe(400);
	});
});

describe('CORS', () => {
	it('permite que el frontend en otro origen llame a la API', async () => {
		const app = crearApp({ tipo: 'memoria', listar: async () => [] });

		const res = await request(app).get('/tareas').set('Origin', 'http://localhost:5173');

		expect(res.headers['access-control-allow-origin']).toBe('*');
	});
});
