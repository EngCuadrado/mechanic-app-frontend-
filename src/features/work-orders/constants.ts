// Espejo de las reglas del backend. Sirve para mostrar u ocultar acciones; el backend sigue siendo la autoridad.

export const WORK_ORDER_TYPES = ["Preventivo", "Correctivo", "Choque", "Entrega", "Devolucion"] as const;
export type WorkOrderType = (typeof WORK_ORDER_TYPES)[number];

/** Tipos que se ofrecen al crear; Entrega/Devolución siguen existiendo pero ya no se crean desde la UI. */
export const CREATABLE_TYPES = ["Preventivo", "Correctivo", "Choque"] as const;

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

export type SectionId = "handover" | "inspections" | "photos" | "services" | "parts";

/** Qué se muestra directo en cada estado, en orden. Lo demás queda tras "Ver todo". */
export const STATUS_SECTIONS: Record<string, SectionId[]> = {
	Recibido: ["handover", "inspections", "photos"],
	"En proceso": ["services", "parts", "photos"],
	Listo: ["inspections", "photos", "handover", "services", "parts"],
};

/** Etapa de fotos que corresponde a cada estado. */
export const STATUS_PHOTO_STAGE: Record<string, string> = { Recibido: "Antes", "En proceso": "Otro", Listo: "Despues" };

/** Motivos de ingreso (lista fija, sin texto libre). Para cambiarlos: editar aquí y en es.json (workOrder.reason.*). */
export const ORDER_REASONS = ["preventive", "brakes", "engine", "suspension", "electrical", "ac", "tires", "collision", "general"] as const;
export const reasonMessageId = (key: string) => `workOrder.reason.${key}`;

/** Servicios que se pueden agregar a una orden (lista fija). Textos en es.json (workOrder.service.*). */
export const SERVICE_CATALOG = ["oilChange", "filters", "brakes", "alignment", "electrical", "suspension", "tires", "ac", "other"] as const;
export const serviceMessageId = (key: string) => `workOrder.service.${key}`;

/** Una orden abierta que lleva más de esto en el taller se marca como atrasada. */
export const OVERDUE_MINUTES = 240;

/** El tipo de orden se deduce del motivo: no se le pregunta al usuario. */
export const orderTypeForReason = (reason: string): WorkOrderType =>
	reason === "preventive" ? "Preventivo" : reason === "collision" ? "Choque" : "Correctivo";
