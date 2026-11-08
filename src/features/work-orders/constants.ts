// Espejo de las reglas del backend. Sirve para mostrar u ocultar acciones; el backend sigue siendo la autoridad.

export const WORK_ORDER_TYPES = ["Preventivo", "Correctivo", "Choque", "Entrega", "Devolucion"] as const;
export type WorkOrderType = (typeof WORK_ORDER_TYPES)[number];

export const WORK_ORDER_STATUSES = ["Recibido", "En proceso", "Listo", "Entregado", "Cancelado"] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

/** Único siguiente estado válido de cada estado (Recibido → En proceso → Listo → Entregado). */
export const NEXT_STATUS: Record<WorkOrderStatus, WorkOrderStatus | null> = {
	Recibido: "En proceso",
	"En proceso": "Listo",
	Listo: "Entregado",
	Entregado: null,
	Cancelado: null,
};

export const CANCELLABLE: readonly string[] = ["Recibido", "En proceso", "Listo"];

/** Entregado y Cancelado son de solo lectura. */
export const isClosed = (status: string) => status === "Entregado" || status === "Cancelado";

/** Entrega y Devolución son actas de alquiler (inspección, fotos y firmas). */
export const isHandover = (type: string) => type === "Entrega" || type === "Devolucion";

export const statusMessageId = (status: string) => `workOrder.status.${status.replace(/\s+/g, "_")}`;
export const typeMessageId = (type: string) => `workOrder.type.${type}`;
