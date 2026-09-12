import { defineConfig } from '@playwright/test';

const PUERTO = 4321;
const URL_BASE = `http://localhost:${PUERTO}`;

export default defineConfig({
	testDir: './e2e',
	// En CI no se permiten pruebas marcadas como .only, y se reintenta una vez
	// para absorber la lentitud puntual de los runners.
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['html'], ['list']] : 'list',
	use: {
		baseURL: URL_BASE,
		// Se usa el canal 'chrome' (el Google Chrome instalado) en lugar del
		// Chromium descargable de Playwright: la descarga del binario falla por
		// timeout de red en este equipo. El comportamiento de la prueba es el
		// mismo y en CI se instala ese mismo canal.
		channel: 'chrome',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},
	webServer: {
		command: 'npm run dev',
		url: URL_BASE,
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
