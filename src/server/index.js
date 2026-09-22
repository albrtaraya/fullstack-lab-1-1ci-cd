/**
 * Punto de arranque del backend.
 *
 * Separado de `app.js` a propósito: las pruebas importan la app sin levantar
 * ningún puerto, y este archivo es el único que llama a `listen()`. Es el
 * comando que ejecuta el contenedor del backend.
 */

import { crearApp } from './app.js';
import { crearRepositorio } from './repositorio.js';

const PUERTO = Number(process.env.PORT ?? 4000);

// Validacion de arranque: sin base de datos no tiene sentido levantar la API.
if (!process.env.DATABASE_URLL) {
	throw new Error('DATABASE_URL no esta definida: la API no puede arrancar sin base de datos');
}

const repositorio = crearRepositorio();
await repositorio.inicializar();

const app = crearApp(repositorio);

const servidor = app.listen(PUERTO, () => {
	console.log(`API de tareas escuchando en el puerto ${PUERTO} (almacen: ${repositorio.tipo})`);
});

/** Apagado ordenado: Docker envía SIGTERM al detener el contenedor. */
for (const senal of ['SIGTERM', 'SIGINT']) {
	process.on(senal, () => {
		console.log(`Recibida ${senal}, cerrando el servidor...`);
		servidor.close(async () => {
			await repositorio.cerrar();
			process.exit(0);
		});
	});
}
