/** Una orden Recibido sin firma de entrada es una recepción abandonada a medias: se puede retomar. */
export const isReceptionIncomplete = (o: { currentStatus: string; dropoffSignatureUrl: string | null }) =>
	o.currentStatus === "Recibido" && !o.dropoffSignatureUrl;

/** A dónde lleva tocar una orden: retomar la recepción si quedó a medias, si no el detalle. */
export const orderPath = (o: { workOrderId: number; currentStatus: string; dropoffSignatureUrl: string | null }) =>
	isReceptionIncomplete(o) ? `/ordenes/${o.workOrderId}/recibir` : `/ordenes/${o.workOrderId}`;
