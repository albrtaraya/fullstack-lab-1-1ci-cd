import js from '@eslint/js';
import globals from 'globals';
import astro from 'eslint-plugin-astro';

export default [
	{
		// Carpetas generadas: build de Astro, tipos, dependencias y los reportes
		// que producen Vitest y Playwright. Lintearlas solo genera ruido sobre
		// código que nadie escribió a mano.
		ignores: [
			'dist/**',
			'.astro/**',
			'node_modules/**',
			'coverage/**',
			'playwright-report/**',
			'test-results/**',
		],
	},
	js.configs.recommended,
	...astro.configs.recommended,
	{
		// Sin esta entrada ESLint ignora los .jsx por completo ("File ignored
		// because no matching configuration was supplied"), y el lint pasaría
		// en verde sin haber revisado ni una línea de los componentes.
		files: ['**/*.{js,mjs,jsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: { jsx: true },
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			'no-unused-vars': 'error',
		},
	},
	{
		// Los archivos de prueba usan las globales que Vitest inyecta con
		// `globals: true` (describe, it, expect, vi).
		files: ['**/*.test.{js,jsx}', 'src/test/**'],
		languageOptions: {
			globals: {
				...globals.vitest,
			},
		},
	},
];
