import { describe, it, expect } from 'vitest';
import {
	esCorreoValido,
	contarTareasPendientes,
	normalizarTitulo,
	esTituloValido,
} from './validaciones';

describe('esCorreoValido', () => {
	it('acepta un correo con formato válido', () => {
		// Arrange
		const correo = 'ana@ejemplo.com';
		// Act
		const resultado = esCorreoValido(correo);
		// Assert
		expect(resultado).toBe(true);
	});

	it('rechaza un correo sin arroba', () => {
		const correo = 'ana-ejemplo.com';
		const resultado = esCorreoValido(correo);
		expect(resultado).toBe(false);
	});

	it('rechaza un correo sin dominio', () => {
		expect(esCorreoValido('ana@')).toBe(false);
	});

	it('no se rompe cuando el valor no es una cadena', () => {
		expect(esCorreoValido(null)).toBe(false);
		expect(esCorreoValido(undefined)).toBe(false);
	});
});

describe('contarTareasPendientes', () => {
	it('cuenta solo las tareas no completadas', () => {
		// Arrange
		const tareas = [{ completada: true }, { completada: false }, { completada: false }];
		// Act
		const resultado = contarTareasPendientes(tareas);
		// Assert
		expect(resultado).toBe(2);
	});

	it('devuelve 0 cuando la lista está vacía', () => {
		expect(contarTareasPendientes([])).toBe(0);
	});
});

describe('normalizarTitulo', () => {
	it('recorta los espacios de los extremos', () => {
		expect(normalizarTitulo('  Comprar pan  ')).toBe('Comprar pan');
	});

	it('colapsa los espacios internos repetidos', () => {
		expect(normalizarTitulo('Comprar    pan')).toBe('Comprar pan');
	});
});

describe('esTituloValido', () => {
	it('acepta un título con contenido real', () => {
		expect(esTituloValido('Comprar pan')).toBe(true);
	});

	it('rechaza un título que solo tiene espacios en blanco', () => {
		expect(esTituloValido('   ')).toBe(false);
	});
});
