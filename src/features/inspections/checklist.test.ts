import { describe, expect, it } from "vitest";
import { allRequiredDone, isAnswered, isValidMileage, missingRequired } from "./checklist";
import type { FormGroup } from "./types";

describe("isValidMileage", () => {
	it("acepta igual o mayor que el último", () => {
		expect(isValidMileage(39400, 39400)).toBe(true);
		expect(isValidMileage(39500, 39400)).toBe(true);
	});
	it("rechaza menor que el último", () => expect(isValidMileage(39000, 39400)).toBe(false));
	it("rechaza vacío, decimal o negativo", () => {
		expect(isValidMileage(null, null)).toBe(false);
		expect(isValidMileage(12.5, null)).toBe(false);
		expect(isValidMileage(-1, null)).toBe(false);
	});
	it("sin lectura previa basta con un entero", () => expect(isValidMileage(0, null)).toBe(true));
});

const item = (itemId: number, isRequired: boolean, inputType = "radio") => ({
	item: { itemId, name: `i${itemId}`, inputType, options: ["a"], isRequired },
	value: null,
	notes: null,
});
const group = (...items: ReturnType<typeof item>[]): FormGroup => ({ category: { name: "c", sortOrder: 1 }, items });

describe("isAnswered", () => {
	it("trata vacío y espacios como sin responder", () => {
		expect(isAnswered("")).toBe(false);
		expect(isAnswered("  ")).toBe(false);
		expect(isAnswered(undefined)).toBe(false);
	});
	it('cuenta "false" como respondido', () => expect(isAnswered("false")).toBe(true));
});

describe("missingRequired", () => {
	it("devuelve los obligatorios sin respuesta", () => {
		expect(missingRequired(group(item(1, true), item(2, false)), {})).toEqual([1]);
	});
	it("no exige opcionales", () => expect(missingRequired(group(item(1, false)), {})).toEqual([]));
	it("un switch (checkbox) nunca queda pendiente", () => expect(missingRequired(group(item(1, true, "checkbox")), {})).toEqual([]));
	it("ya respondidos no faltan", () => expect(missingRequired(group(item(1, true)), { 1: "a" })).toEqual([]));
});

describe("allRequiredDone", () => {
	it("checklist vacío no bloquea", () => expect(allRequiredDone([], {})).toBe(true));
	it("falla si falta un obligatorio en cualquier categoría", () => {
		expect(allRequiredDone([group(item(1, true)), group(item(2, true))], { 1: "a" })).toBe(false);
	});
});
