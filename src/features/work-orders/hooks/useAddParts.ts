import { useRef, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { AGREGAR_REPUESTO, EDITAR_REPUESTO } from "../api/itemMutations";
import type { WorkOrderPart } from "../types";

export interface PartLine {
	partId: number;
	quantity: number;
}

/**
 * Agrega varios repuestos a la orden, uno tras otro (cada llamada descuenta stock).
 * Si el repuesto ya está en la orden suma la cantidad en vez de duplicarlo.
 * Devuelve los partId que el servidor rechazó (el error ya se mostró en un toast).
 */
export function useAddParts(existing: WorkOrderPart[]) {
	const client = useApolloClient();
	const [add] = useApiMutation(AGREGAR_REPUESTO);
	const [edit] = useApiMutation(EDITAR_REPUESTO);
	const [adding, setAdding] = useState(false);
	const busy = useRef(false);

	const addParts = async (workOrderId: number, lines: PartLine[]): Promise<number[]> => {
		if (busy.current) return lines.map((l) => l.partId);
		busy.current = true;
		setAdding(true);
		const failed: number[] = [];
		for (const l of lines) {
			const saved = existing.find((p) => p.partId === l.partId);
			const ok = saved
				? await edit({ workOrderPartId: saved.workOrderPartId, quantity: saved.quantity + l.quantity })
				: await add({ workOrderId, partId: l.partId, quantity: l.quantity });
			if (!ok) failed.push(l.partId);
		}
		await client.refetchQueries({ include: ["GetWorkOrder", "GetWorkOrders"] });
		busy.current = false;
		setAdding(false);
		return failed;
	};

	return { addParts, adding };
}
