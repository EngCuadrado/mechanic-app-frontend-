import { useState } from "react";
import { useIntl } from "react-intl";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { CREAR_INSPECCION, GUARDAR_RESULTADOS } from "../../inspections";
import { useUploadShots } from "../../photos";
import { CREAR_ORDEN } from "../api/mutations";
import { AGREGAR_SERVICIO } from "../api/itemMutations";
import { orderTypeForServices, serviceMessageId } from "../constants";

interface Reception {
	vehicleId: number;
	/** Claves de SERVICE_CATALOG: lo que se le va a hacer. */
	services: string[];
	/** Respuestas del checklist básico (guardarResultadosInspeccion). */
	results: { itemId: number; value: string; notes: string | null }[];
	shots: { angle: string; file: File }[];
}

const REFETCH = { refetchQueries: ["GetWorkOrders", "GetWorkOrderStatusCounts"] };

/**
 * Crea la orden de una recepción en una pantalla: orden → servicios (precio 0, se completa después) → inspección de entrada con
 * sus respuestas → fotos. Devuelve el id y si todo quedó guardado; si algo falló, la orden ya existe y se retoma ("Recepción incompleta").
 */
export function useCreateReception() {
	const intl = useIntl();
	const [createOrder] = useApiMutation<{ crearOrden: { workOrderId: number } }>(CREAR_ORDEN, REFETCH);
	const [addService] = useApiMutation(AGREGAR_SERVICIO);
	const [createInspection] = useApiMutation<{ crearInspeccion: { vehicleInspectionId: number } }>(CREAR_INSPECCION);
	const [saveResults] = useApiMutation(GUARDAR_RESULTADOS);
	const uploadShots = useUploadShots();
	const [busy, setBusy] = useState(false);

	const submit = async ({ vehicleId, services, results, shots }: Reception): Promise<{ id: number; complete: boolean } | null> => {
		setBusy(true);
		try {
			const labels = services.map((k) => intl.formatMessage({ id: serviceMessageId(k), defaultMessage: k }));
			const order = await createOrder({ vehicleId, type: orderTypeForServices(services), reportedIssue: labels.join(", ") });
			if (!order) return null;
			const id = order.crearOrden.workOrderId;

			// Uno tras otro: cada servicio recalcula el total de la misma orden en una transacción; en paralelo chocan (deadlock).
			const added: boolean[] = [];
			for (const description of labels) added.push(Boolean(await addService({ workOrderId: id, description, internalCost: 0, price: 0 })));
			const inspection = await createInspection({ workOrderId: id, inspectionType: "Entrada" });
			const inspectionId = inspection?.crearInspeccion.vehicleInspectionId ?? null;
			const saved = inspectionId !== null && (results.length === 0 || Boolean(await saveResults({ id: inspectionId, results, validar: true })));
			const failedShots = await uploadShots(id, "Antes", inspectionId, shots);
			return { id, complete: added.every(Boolean) && saved && failedShots.length === 0 };
		} finally {
			setBusy(false);
		}
	};

	return { submit, busy };
}
