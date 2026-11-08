import { describe, expect, it } from "vitest";
import { allRequiredDone, isAnswered, missingRequired } from "./checklist";
import type { FormGroup } from "./types";

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
