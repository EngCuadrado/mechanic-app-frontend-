import type { WorkOrderDetail } from "../types";

export type TaskTarget = "services" | "inspections" | "photos" | "handover";

export interface OrderTask {
	id: string;
	/** Clave de es.json bajo workOrder.guide.task.* */
	labelId: string;
	done: boolean;
	target: TaskTarget;
}

/** Lo que conviene completar en cada estado antes de pasar al siguiente. Solo guía: el backend no lo exige. */
export function useOrderTasks(order: WorkOrderDetail): OrderTask[] {
	const hasInspection = (type: string) => order.inspections.some((i) => i.inspectionType === type);

	switch (order.currentStatus) {
		case "Recibido":
			return [
				{ id: "dropoffSignature", labelId: "dropoffSignature", done: Boolean(order.dropoffSignatureUrl), target: "handover" },
				{ id: "entryInspection", labelId: "entryInspection", done: hasInspection("Entrada"), target: "inspections" },
			];
		case "En proceso":
			return [{ id: "services", labelId: "services", done: order.services.length > 0, target: "services" }];
		case "Listo":
			return [
				{ id: "exitInspection", labelId: "exitInspection", done: hasInspection("Salida"), target: "inspections" },
				{ id: "pickupSignature", labelId: "pickupSignature", done: Boolean(order.pickupSignatureUrl), target: "handover" },
			];
		default:
			return [];
	}
}
