import { describe, expect, it } from "vitest";
import { serviceMissing } from "./addWork";

describe("serviceMissing", () => {
	it("pide elegir servicio", () => expect(serviceMissing({ key: null, price: 1, cost: null })).toBe("pickService"));
	it("pide precio", () => expect(serviceMissing({ key: "oilChange", price: null, cost: null })).toBe("price"));
	it("pide costo en externos", () => expect(serviceMissing({ key: "bodywork", price: 500, cost: null })).toBe("cost"));
	it("externo completo", () => expect(serviceMissing({ key: "bodywork", price: 500, cost: 300 })).toBeNull());
	it("normal sin costo es válido", () => expect(serviceMissing({ key: "oilChange", price: 450, cost: null })).toBeNull());
});
