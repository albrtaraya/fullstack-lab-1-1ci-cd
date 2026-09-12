import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/test/setup.js',
		// Las pruebas E2E las ejecuta Playwright, no Vitest.
		exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/**/*.{js,jsx}', 'src/server/**/*.js'],
			exclude: ['src/test/**', '**/*.test.{js,jsx}'],
			// Sin este bloque, Vitest informa el porcentaje pero nunca falla.
			// Con él, `vitest run --coverage` devuelve error si la cobertura baja
			// del umbral, que es lo que convierte la cobertura en parte real del
			// quality gate del Laboratorio 3.
			thresholds: {
				lines: 60,
				functions: 60,
				branches: 50,
				statements: 60,
			},
		},
	},
});
