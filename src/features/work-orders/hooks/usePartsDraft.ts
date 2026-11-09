import { useCallback, useEffect, useRef, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useIntl } from "react-intl";
import { toast } from "sonner";
import { apiErrorMessage } from "../../../shared/utils/apiError";
import { AGREGAR_REPUESTO, EDITAR_REPUESTO, QUITAR_REPUESTO } from "../api/itemMutations";
import type { WorkOrderPart } from "../types";

const DELAY_MS = 1500;

export interface NewPart {
	partId: number;
	name: string;
	unitPrice: number | null;
}

export interface PartRow {
	/** `s<id>` repuesto ya guardado; `n<partId>` repuesto nuevo aún local. */
	key: string;
	name: string;
	unitPrice: number | null;
	quantity: number;
}

/**
 * Repuestos de una orden con edición local: los cambios se ven al instante y se mandan al servidor juntos,
 * 1.5 s después del último toque o al salir de la pantalla. Si el servidor rechaza algo, vuelve al valor guardado.
 */
export function usePartsDraft(workOrderId: number, server: WorkOrderPart[]) {
	const intl = useIntl();
	const client = useApolloClient();
	const [qty, setQty] = useState<Record<string, number>>({});
	const [added, setAdded] = useState<Record<number, NewPart>>({});
	const [saving, setSaving] = useState(false);
	const latest = useRef({ qty, server });
	latest.current = { qty, server };
	const busy = useRef(false);
	const again = useRef(false);
	const mounted = useRef(true);

	const rows: PartRow[] = [
		...server.map((p) => ({ key: `s${p.workOrderPartId}`, name: p.part?.name ?? "", unitPrice: p.unitPrice, quantity: p.quantity })),
		...Object.values(added).map((p) => ({ key: `n${p.partId}`, name: p.name, unitPrice: p.unitPrice, quantity: 0 })),
	]
		.map((r) => ({ ...r, quantity: qty[r.key] ?? r.quantity }))
		.filter((r) => r.quantity > 0);

	const flush = useCallback(async (override?: Record<string, number>) => {
		if (busy.current) {
			again.current = true;
			return;
		}
		const sent = { ...latest.current.qty, ...override };
		if (Object.keys(sent).length === 0) return;
		busy.current = true;
		if (mounted.current) setSaving(true);
		const call = async (mutation: typeof AGREGAR_REPUESTO, variables: Record<string, unknown>) => {
			try {
				await client.mutate({ mutation, variables });
			} catch (err) {
				toast.error(apiErrorMessage(intl, err));
			}
		};
		for (const [key, quantity] of Object.entries(sent)) {
			const id = Number(key.slice(1));
			if (key[0] === "n") {
				// Si un guardado anterior ya creó este repuesto, se edita en vez de duplicarlo.
				const saved = latest.current.server.find((p) => p.partId === id);
				if (saved) await call(EDITAR_REPUESTO, { workOrderPartId: saved.workOrderPartId, quantity });
				else if (quantity > 0) await call(AGREGAR_REPUESTO, { workOrderId, partId: id, quantity });
			} else if (quantity <= 0) await call(QUITAR_REPUESTO, { workOrderPartId: id });
			else if (quantity !== latest.current.server.find((p) => p.workOrderPartId === id)?.quantity)
				await call(EDITAR_REPUESTO, { workOrderPartId: id, quantity });
		}
		await client.refetchQueries({ include: ["GetWorkOrder", "GetWorkOrders"] });
		busy.current = false;
		if (mounted.current) {
			setSaving(false);
			// Quita solo lo que se mandó; lo que cambió mientras tanto sigue pendiente.
			setQty((cur) => Object.fromEntries(Object.entries(cur).filter(([k, v]) => sent[k] !== v)));
			setAdded((cur) => Object.fromEntries(Object.entries(cur).filter(([id]) => !(`n${id}` in sent))));
		}
		if (again.current) {
			again.current = false;
			flush();
		}
	}, [client, intl, workOrderId]);

	const dirty = Object.keys(qty).length > 0;
	useEffect(() => {
		if (!dirty) return;
		const id = setTimeout(flush, DELAY_MS);
		return () => clearTimeout(id);
	}, [qty, dirty, flush]);

	// Al salir de la pantalla o cambiar de pestaña se guarda lo pendiente.
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			if (Object.keys(latest.current.qty).length > 0) flush();
		};
	}, [flush]);

	// Avisa si cierran la pestaña del navegador con cambios sin guardar.
	useEffect(() => {
		if (!dirty) return;
		const warn = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [dirty]);

	const setQuantity = (key: string, quantity: number) => setQty((cur) => ({ ...cur, [key]: quantity }));

	/** Suma 1 si el repuesto ya está en la orden; si no, lo agrega local. */
	const add = (part: NewPart) => {
		const existing = rows.find((r) => (r.key === `n${part.partId}`) || server.some((s) => `s${s.workOrderPartId}` === r.key && s.partId === part.partId));
		if (existing) return setQuantity(existing.key, existing.quantity + 1);
		setAdded((cur) => ({ ...cur, [part.partId]: part }));
		setQuantity(`n${part.partId}`, 1);
	};

	/** Quita ya, sin esperar el retraso: un borrado no se deja en cola. */
	const removeNow = (key: string) => {
		setQuantity(key, 0);
		flush({ [key]: 0 });
	};

	return { rows, add, setQuantity, remove: removeNow, saving, pending: dirty };
}
