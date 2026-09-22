// @vitest-environment node

import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app, { crearApp } from '../src/server/app.js';

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

describe('Resumen de tareas', () => {
	/** Repositorio mínimo con una lista fija, para controlar los números. */
	function repositorioCon(tareas) {
		return { tipo: 'prueba', listar: async () => tareas };
	}

	it('cuenta el total, las pendientes y las completadas', async () => {
		const appConDatos = crearApp(
			repositorioCon([
				{ id: 1, titulo: 'Preparar la demo', completada: false },
				{ id: 2, titulo: 'Ensayar la presentacion', completada: false },
				{ id: 3, titulo: 'Configurar Railway', completada: true },
			]),
		);

		const res = await request(appConDatos).get('/tareas/resumen');

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ total: 3, pendientes: 2, completadas: 1 });
	});

	it('con la lista vacia devuelve todo en cero', async () => {
		const res = await request(crearApp(repositorioCon([]))).get('/tareas/resumen');

		expect(res.body).toEqual({ total: 0, pendientes: 0, completadas: 0 });
	});

	it('si el almacen falla responde con error del servidor', async () => {
		const roto = {
			tipo: 'prueba',
			listar: async () => {
				throw new Error('sin conexion');
			},
		};

		const res = await request(crearApp(roto)).get('/tareas/resumen');

		expect(res.status).toBe(500);
	});
});
