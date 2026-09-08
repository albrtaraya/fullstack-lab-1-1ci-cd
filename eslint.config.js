import js from '@eslint/js';
import globals from 'globals';
import astro from 'eslint-plugin-astro';

export default [
	{
		ignores: ['dist/**', '.astro/**', 'node_modules/**'],
	},
	js.configs.recommended,
	...astro.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			'no-unused-vars': 'error',
		},
	},
];
