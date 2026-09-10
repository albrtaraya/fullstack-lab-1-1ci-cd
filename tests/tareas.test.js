// @vitest-environment node

import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../src/server/app.js';

describe('API de tareas', () => {
	it('crea una tarea nueva', async () => {
		const res = await request(app).post('/tareas').send({ titulo: 'Escribir informe' });

		expect(res.status).toBe(201);
		expect(res.body.titulo).toBe('Escribir informe');
	});

	it('lista las tareas creadas', async () => {
		const res = await request(app).get('/tareas');

		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
	});

	// --- Ticket BUG 3: el endpoint acepta y guarda una tarea con título vacío ---

	it('rechaza crear una tarea con titulo vacio', async () => {
		const res = await request(app).post('/tareas').send({ titulo: '' });

		expect(res.status).toBe(400);
	});

	it('rechaza crear una tarea cuyo titulo son solo espacios', async () => {
		const res = await request(app).post('/tareas').send({ titulo: '   ' });

		expect(res.status).toBe(400);
	});

	it('no guarda las tareas rechazadas en la lista', async () => {
		await request(app).post('/tareas').send({ titulo: '   ' });

		const res = await request(app).get('/tareas');
		const titulosVacios = res.body.filter((t) => !t.titulo || !t.titulo.trim());

		expect(titulosVacios).toHaveLength(0);
	});
});
