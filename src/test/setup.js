import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

/**
 * Las pruebas de componente no deben salir a la red.
 *
 * `ListaTareas` intenta hablar con la API de tareas al montarse. Sin este
 * stub, el resultado de la suite dependería de si el backend está levantado
 * en la máquina — verde con Docker corriendo, distinto sin él. Se fuerza un
 * `fetch` que siempre falla, de modo que el componente tome su camino de
 * repliegue local y las pruebas sean deterministas aquí y en el pipeline.
 *
 * Una prueba que necesite simular la API puede sobrescribir `global.fetch`.
 */
beforeEach(() => {
	global.fetch = vi.fn(() => Promise.reject(new Error('red deshabilitada en pruebas')));
});
