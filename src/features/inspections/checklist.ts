import type { FormGroup } from "./types";

/** Vacío o solo espacios = sin responder. "false" (un No) sí cuenta como respuesta. */
export const isAnswered = (value: string | null | undefined) => (value ?? "").trim() !== "";

/** Ids de los ítems obligatorios de una categoría sin respuesta. Un switch (checkbox) siempre tiene valor (Sí por defecto). */
export const missingRequired = (group: FormGroup, values: Record<number, string>): number[] =>
	group.items
		.filter(({ item }) => item.isRequired && item.inputType !== "checkbox" && !isAnswered(values[item.itemId]))
		.map(({ item }) => item.itemId);

export const allRequiredDone = (groups: FormGroup[], values: Record<number, string>) =>
	groups.every((g) => missingRequired(g, values).length === 0);

/** Km válido: entero, no negativo y no menor que la última lectura del carro (el odómetro no baja). */
export const isValidMileage = (km: number | null, last: number | null) =>
	km !== null && Number.isInteger(km) && km >= 0 && km >= (last ?? 0);
