// (Opcional, pero buena práctica) Define los tipos de las props
type StringAvatarProps = {
	name: string;
	size?: number; // El '?' significa que es opcional
};

function stringToSoftColor(string: string): string {
	let hash = 0;
	let i;

	// Generación del hash (similar al original)
	for (i = 0; i < string.length; i += 1) {
		hash = string.charCodeAt(i) + ((hash << 5) - hash);
	}

	// --- CONTROL DE LUMINOSIDAD Y SATURACIÓN ---

	// 1. Calcular el Tono (Hue)
	// El tono (H) debe ser un valor entre 0 y 360, obtenido del hash.
	const hue = hash % 360;

	// 2. Establecer Saturación (S) y Luminosidad (L) para colores suaves
	// S: 50% - 70% (Buena saturación pero no excesiva)
	const saturation = 65;
	// L: 40% - 60% (Brillo moderado, evitando colores muy claros o muy oscuros)
	const lightness = 55;

	// 3. Convertir HSL a HEX
	// Esta función auxiliar se usa para la conversión.
	const hslToHex = (h: number, s: number, l: number): string => {
		l /= 100;
		const a = (s * Math.min(l, 1 - l)) / 100;
		const f = (n: number) => {
			const k = (n + h / 30) % 12;
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, "0");
		};
		return `#${f(0)}${f(8)}${f(4)}`;
	};

	// Devuelve el color HEX resultante.
	return hslToHex(hue, saturation, lightness);
}

export function stringAvatar({ name, size = 45 }: StringAvatarProps) {
	// 1. COMPROBACIÓN INICIAL
	// Si 'name' es null, undefined, un string vacío ("")
	// o solo espacios en blanco (" "), retorna null.
	if (!name || name.trim() === "") {
		return null;
		// Opcionalmente, retorna un avatar por defecto:
		// return { sx: { bgcolor: '#cccccc' }, children: '?' };
	}

	// 2. LIMPIAR Y SEPARAR EL NOMBRE
	// .split(' ') divide el nombre por espacios
	// .filter(Boolean) elimina cualquier entrada vacía
	// (útil si hay dobles espacios, ej: "Juan  Perez")
	const parts = name.split(" ").filter(Boolean);

	// Si después de limpiar no queda nada (ej: name era " "), retorna null
	if (parts.length === 0) {
		return null;
	}

	// 3. GENERAR INICIALES
	let children = "";

	if (parts.length > 1) {
		// Caso 1: Hay 2 o más palabras (ej: "Juan Perez")
		// Toma la primera letra de las primeras dos palabras
		children = `${parts[0][0]}${parts[1][0]}`;
	} else {
		// Caso 2: Hay 1 sola palabra (ej: "Juan" o "Admin")
		// Toma la primera letra de esa única palabra
		children = `${parts[0][0]}`;
		// Opcional: si prefieres 2 letras para nombres únicos:
		// children = parts[0].substring(0, 2);
	}

	// 4. RETORNAR EL OBJETO
	return {
		sx: {
			width: size,
			height: size,
			bgcolor: stringToSoftColor(name),
		},
		// .toUpperCase() asegura que las iniciales sean mayúsculas
		children: children.toUpperCase(),
	};
}
