import type { FormGroup } from "./types";

/** Para llenar: solo los ítems activos (el backend también manda los inactivos ya contestados, para ver inspecciones viejas). */
export const activeOnly = (groups: FormGroup[]): FormGroup[] =>
	groups.map((g) => ({ ...g, items: g.items.filter(({ item }) => item.isActive !== false) })).filter((g) => g.items.length > 0);

/** Vacío o solo espacios = sin responder. "false" (un No) sí cuenta como respuesta. */
export const isAnswered = (value: string | null | undefined) => (value ?? "").trim() !== "";

/** Ids de los ítems obligatorios de una categoría sin respuesta. Un switch (checkbox) siempre tiene valor (Sí por defecto). */
export const missingRequired = (group: FormGroup, values: Record<number, string>): number[] =>
	group.items
		.filter(({ item }) => item.isRequired && item.inputType !== "checkbox" && !isAnswered(values[item.itemId]))
		.map(({ item }) => item.itemId);

export const allRequiredDone = (groups: FormGroup[], values: Record<number, string>) =>
	groups.every((g) => missingRequired(g, values).length === 0);

/** Valores de partida: lo guardado, o "true" (bien) en los sí/no y vacío en el resto. Notas guardadas. */
export function initialValues(groups: FormGroup[]) {
	const values: Record<number, string> = {};
	const notes: Record<number, string> = {};
	groups.forEach((g) =>
		g.items.forEach(({ item, value, notes: note }) => {
			values[item.itemId] = value ?? (item.inputType === "checkbox" ? "true" : "");
			if (note) notes[item.itemId] = note;
		}),
	);
	return { values, notes };
}

/** Respuestas para guardarResultadosInspeccion: solo las contestadas, con su nota si tiene. */
export const toResults = (groups: FormGroup[], values: Record<number, string>, notes: Record<number, string>) =>
	groups
		.flatMap((g) => g.items)
		.filter(({ item }) => isAnswered(values[item.itemId]))
		.map(({ item }) => ({ itemId: item.itemId, value: values[item.itemId], notes: notes[item.itemId]?.trim() || null }));
