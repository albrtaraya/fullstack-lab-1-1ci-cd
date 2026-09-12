import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import ListaTareas from './ListaTareas';

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
