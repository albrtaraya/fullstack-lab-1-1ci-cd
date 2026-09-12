import { test, expect } from '@playwright/test';

/**
 * Espera a que las islas de Astro terminen de hidratarse.
 *
 * El HTML del componente llega desde el servidor antes de que React tome el
 * control. Si Playwright escribe en el campo durante esa ventana, el valor
 * queda en el DOM pero React nunca se entera, y el formulario se envía con el
 * estado vacío. Astro marca las islas sin hidratar con el atributo `ssr` y lo
 * elimina al terminar, así que esa es la señal fiable que esperamos.
 */
async function esperarHidratacion(page) {
	await page.waitForFunction(() => {
		const islas = document.querySelectorAll('astro-island');
		return islas.length > 0 && [...islas].every((isla) => !isla.hasAttribute('ssr'));
	});
}

test('un usuario puede crear una tarea y verla en la lista', async ({ page }) => {
	// 1. Entrar a la aplicación
	await page.goto('/');
	await esperarHidratacion(page);

	// 2. Crear una tarea
	await page.getByLabel('Nueva tarea').fill('Comprar pan');
	await page.getByRole('button', { name: 'Agregar' }).click();

	// 3. Verla en la lista
	await expect(page.getByText('Comprar pan')).toBeVisible();
});

test('el contador de pendientes refleja las tareas agregadas', async ({ page }) => {
	await page.goto('/');
	await esperarHidratacion(page);

	await expect(page.getByText('0 tareas pendientes')).toBeVisible();

	await page.getByLabel('Nueva tarea').fill('Escribir el informe');
	await page.getByRole('button', { name: 'Agregar' }).click();

	await expect(page.getByText('1 tarea pendiente')).toBeVisible();
});

test('no se agrega una tarea cuyo titulo son solo espacios', async ({ page }) => {
	await page.goto('/');
	await esperarHidratacion(page);

	await page.getByLabel('Nueva tarea').fill('   ');
	await page.getByRole('button', { name: 'Agregar' }).click();

	await expect(page.getByText('0 tareas pendientes')).toBeVisible();
});

test('el campo queda limpio despues de agregar una tarea', async ({ page }) => {
	await page.goto('/');
	await esperarHidratacion(page);

	const campo = page.getByLabel('Nueva tarea');
	await campo.fill('Revisar el Pull Request');
	await page.getByRole('button', { name: 'Agregar' }).click();

	await expect(campo).toHaveValue('');
});
