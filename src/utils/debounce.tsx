/**
 * 🛠️ Función auxiliar para crear un debounce.
 * El debounce asegura que una función no se ejecute hasta que haya
 * transcurrido un tiempo determinado (delay) sin que se la haya llamado nuevamente.
 *
 * Esto es útil para limitar la frecuencia de eventos (como clics rápidos o inputs).
 *
 * @param func La función a ejecutar después del retraso.
 * @param delay El tiempo de retraso en milisegundos.
 * @returns Una función debounced que envuelve y retrasa la ejecución de `func`.
 */
export const debounce = (func: Function, delay: number) => {
	let timeoutId: ReturnType<typeof setTimeout> | null;

	return function (this: any, ...args: any[]) {
		// Si ya existe un temporizador, lo cancela.
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		// Establece un nuevo temporizador.
		timeoutId = setTimeout(() => {
			func.apply(this, args);
			timeoutId = null; // Opcional: Reinicia el ID
		}, delay);
	};
};
