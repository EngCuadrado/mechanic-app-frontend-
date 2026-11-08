import { expect, it } from "vitest";
import { isReceptionIncomplete, orderPath } from "./readiness";

it("Recibido sin firma de entrada está incompleta", () => {
	expect(isReceptionIncomplete({ currentStatus: "Recibido", dropoffSignatureUrl: null })).toBe(true);
});
it("Recibido con firma está completa", () => {
	expect(isReceptionIncomplete({ currentStatus: "Recibido", dropoffSignatureUrl: "https://x" })).toBe(false);
});
it("otros estados no se marcan", () => {
	expect(isReceptionIncomplete({ currentStatus: "En proceso", dropoffSignatureUrl: null })).toBe(false);
});

import { orderTypeForReason } from "./constants";
it("el tipo de orden sale del motivo", () => {
	expect(orderTypeForReason("preventive")).toBe("Preventivo");
	expect(orderTypeForReason("collision")).toBe("Choque");
	expect(orderTypeForReason("brakes")).toBe("Correctivo");
});

it("orderPath retoma la recepción incompleta y si no abre el detalle", () => {
	expect(orderPath({ workOrderId: 7, currentStatus: "Recibido", dropoffSignatureUrl: null })).toBe("/ordenes/7/recibir");
	expect(orderPath({ workOrderId: 7, currentStatus: "Listo", dropoffSignatureUrl: null })).toBe("/ordenes/7");
});
