import { isExternalService } from "./constants";

export type ServiceMissing = "pickService" | "price" | "cost";

/** Qué falta para poder agregar un servicio (null = completo). El costo solo se pide en servicios externos. */
export function serviceMissing(v: { key: string | null; price: number | null; cost: number | null }): ServiceMissing | null {
	if (!v.key) return "pickService";
	if (v.price === null) return "price";
	if (isExternalService(v.key) && v.cost === null) return "cost";
	return null;
}
