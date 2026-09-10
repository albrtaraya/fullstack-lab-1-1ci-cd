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
});
