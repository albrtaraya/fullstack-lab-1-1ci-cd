import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ListaTareas from './ListaTareas';

/** Respuesta HTTP mínima con la forma que usa el componente. */
function respuesta(cuerpo, ok = true) {
	return Promise.resolve({ ok, json: () => Promise.resolve(cuerpo) });
}

describe('ListaTareas conectada a la API', () => {
	it('muestra las tareas que devuelve la API al montarse', async () => {
		global.fetch = vi.fn(() => respuesta([{ id: 1, titulo: 'Desde PostgreSQL', completada: false }]));

		render(<ListaTareas />);

		expect(await screen.findByText('Desde PostgreSQL')).toBeInTheDocument();
		expect(screen.getByText('1 tarea pendiente')).toBeInTheDocument();
	});

	it('guarda la tarea nueva en la API y muestra la fila que devuelve', async () => {
		global.fetch = vi
			.fn()
			.mockImplementationOnce(() => respuesta([]))
			.mockImplementationOnce(() => respuesta({ id: 42, titulo: 'Comprar pan', completada: false }));
		render(<ListaTareas />);
		const usuario = userEvent.setup();
		// Espera a que termine la carga inicial y el componente pase a modo API.
		await vi.waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

		await usuario.type(screen.getByLabelText('Nueva tarea'), 'Comprar pan');
		await usuario.click(screen.getByText('Agregar'));

		expect(await screen.findByText('Comprar pan')).toBeInTheDocument();
		const [url, opciones] = global.fetch.mock.calls[1];
		expect(url).toMatch(/\/tareas$/);
		expect(opciones.method).toBe('POST');
		expect(JSON.parse(opciones.body)).toEqual({ titulo: 'Comprar pan' });
	});

	it('si la API rechaza el alta, la tarea se conserva en local', async () => {
		global.fetch = vi
			.fn()
			.mockImplementationOnce(() => respuesta([]))
			.mockImplementationOnce(() => respuesta({ error: 'fallo' }, false));
		render(<ListaTareas />);
		const usuario = userEvent.setup();
		await vi.waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

		await usuario.type(screen.getByLabelText('Nueva tarea'), 'Escribir el informe');
		await usuario.click(screen.getByText('Agregar'));

		expect(await screen.findByText('Escribir el informe')).toBeInTheDocument();
	});

	it('si la API se cae a mitad de sesion, la tarea se conserva en local', async () => {
		global.fetch = vi
			.fn()
			.mockImplementationOnce(() => respuesta([]))
			.mockImplementationOnce(() => Promise.reject(new Error('sin red')));
		render(<ListaTareas />);
		const usuario = userEvent.setup();
		await vi.waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

		await usuario.type(screen.getByLabelText('Nueva tarea'), 'Revisar el PR');
		await usuario.click(screen.getByText('Agregar'));

		expect(await screen.findByText('Revisar el PR')).toBeInTheDocument();
	});

	it('si la carga inicial responde con error, arranca vacia en modo local', async () => {
		global.fetch = vi.fn(() => respuesta(null, false));

		render(<ListaTareas />);

		await vi.waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
		expect(screen.getByText('0 tareas pendientes')).toBeInTheDocument();
	});
});

describe('ListaTareas', () => {
	it('arranca sin tareas pendientes', () => {
		render(<ListaTareas />);

		expect(screen.getByText('0 tareas pendientes')).toBeInTheDocument();
	});

	it('agrega una tarea y la muestra en la lista', async () => {
		render(<ListaTareas />);
		const usuario = userEvent.setup();

		await usuario.type(screen.getByLabelText('Nueva tarea'), 'Comprar pan');
		await usuario.click(screen.getByText('Agregar'));

		expect(screen.getByText('Comprar pan')).toBeInTheDocument();
	});

	it('usa el singular cuando queda una sola tarea pendiente', async () => {
		render(<ListaTareas />);
		const usuario = userEvent.setup();

		await usuario.type(screen.getByLabelText('Nueva tarea'), 'Escribir el informe');
		await usuario.click(screen.getByText('Agregar'));

		expect(screen.getByText('1 tarea pendiente')).toBeInTheDocument();
	});

	it('usa el plural cuando hay varias tareas pendientes', async () => {
		render(<ListaTareas />);
		const usuario = userEvent.setup();
		const campo = screen.getByLabelText('Nueva tarea');
		const boton = screen.getByText('Agregar');

		await usuario.type(campo, 'Primera');
		await usuario.click(boton);
		await usuario.type(campo, 'Segunda');
		await usuario.click(boton);

		expect(screen.getByText('2 tareas pendientes')).toBeInTheDocument();
	});

	it('marcar una tarea como completada la descuenta del contador', async () => {
		render(<ListaTareas />);
		const usuario = userEvent.setup();

		await usuario.type(screen.getByLabelText('Nueva tarea'), 'Revisar el Pull Request');
		await usuario.click(screen.getByText('Agregar'));
		expect(screen.getByText('1 tarea pendiente')).toBeInTheDocument();

		await usuario.click(screen.getByRole('checkbox'));

		expect(screen.getByText('0 tareas pendientes')).toBeInTheDocument();
	});

	it('desmarcar una tarea completada la vuelve a contar', async () => {
		render(<ListaTareas />);
		const usuario = userEvent.setup();

		await usuario.type(screen.getByLabelText('Nueva tarea'), 'Preparar la entrega');
		await usuario.click(screen.getByText('Agregar'));

		const casilla = screen.getByRole('checkbox');
		await usuario.click(casilla);
		await usuario.click(casilla);

		expect(screen.getByText('1 tarea pendiente')).toBeInTheDocument();
	});

	it('no agrega una tarea cuyo titulo son solo espacios', async () => {
		render(<ListaTareas />);
		const usuario = userEvent.setup();

		await usuario.type(screen.getByLabelText('Nueva tarea'), '   ');
		await usuario.click(screen.getByText('Agregar'));

		expect(screen.getByText('0 tareas pendientes')).toBeInTheDocument();
		expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
	});
});
