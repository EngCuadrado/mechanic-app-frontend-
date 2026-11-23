import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { CREAR_INSPECCION, EDITAR_INSPECCION, GET_INSPECTION_FORM, GUARDAR_RESULTADOS } from "../api/inspections";
import { isAnswered } from "../checklist";
import type { FormGroup, InspectionFormData } from "../types";

interface Args {
	workOrderId: number;
	type: "Entrada" | "Salida";
	/** Si la orden ya tiene esta inspección se reutiliza (retomar una recepción). */
	existingId?: number | null;
}

const EMPTY: FormGroup[] = [];

/**
 * Checklist de una inspección: la crea (una sola vez) si no existe, carga las categorías del backend y guarda todo junto al final.
 * Por excepción: un switch (checkbox) empieza en "true" (bien) y solo se tocan los que tienen problema; el resto empieza sin respuesta.
 */
export function useChecklist({ workOrderId, type, existingId = null }: Args) {
	const [inspectionId, setInspectionId] = useState<number | null>(existingId);
	const [failed, setFailed] = useState(false);
	const [values, setValues] = useState<Record<number, string>>({});
	const [notes, setNotes] = useState<Record<number, string>>({});
	const creating = useRef(false);
	const initialized = useRef<number | null>(null);
	const [create] = useApiMutation<{ crearInspeccion: { vehicleInspectionId: number } }>(CREAR_INSPECCION);
	const [save, saving] = useApiMutation(GUARDAR_RESULTADOS);
	const [edit, editing] = useApiMutation(EDITAR_INSPECCION);

	useEffect(() => {
		if (inspectionId !== null || creating.current) return;
		creating.current = true; // evita crear dos veces (doble render o doble toque)
		create({ workOrderId, inspectionType: type }).then((d) => {
			if (d) setInspectionId(d.crearInspeccion.vehicleInspectionId);
			else setFailed(true);
		});
	}, [inspectionId, create, workOrderId, type]);

	const { data, loading, error } = useQuery<{ inspectionForm: InspectionFormData }>(GET_INSPECTION_FORM, {
		variables: { id: inspectionId },
		skip: inspectionId === null,
		fetchPolicy: "network-only",
	});
	const groups = data?.inspectionForm.groups ?? EMPTY;

	useEffect(() => {
		if (!data || initialized.current === inspectionId) return;
		initialized.current = inspectionId;
		const v: Record<number, string> = {};
		const n: Record<number, string> = {};
		groups.forEach((g) =>
			g.items.forEach(({ item, value, notes: note }) => {
				v[item.itemId] = value ?? (item.inputType === "checkbox" ? "true" : "");
				if (note) n[item.itemId] = note;
			}),
		);
		setValues(v);
		setNotes(n);
	}, [data, groups, inspectionId]);

	const setValue = useCallback((itemId: number, v: string) => setValues((p) => ({ ...p, [itemId]: v })), []);
	const setNote = useCallback((itemId: number, v: string) => setNotes((p) => ({ ...p, [itemId]: v })), []);

	/** Guarda el km y todas las respuestas en un lote; el backend valida que no falte ningún obligatorio. */
	const finish = async (mileage: number | null) => {
		if (inspectionId === null) return false;
		if (mileage !== null && !(await edit({ id: inspectionId, mileage }))) return false;
		if (groups.length === 0) return true;
		const results = groups
			.flatMap((g) => g.items)
			.filter(({ item }) => isAnswered(values[item.itemId]))
			.map(({ item }) => ({ itemId: item.itemId, value: values[item.itemId], notes: notes[item.itemId]?.trim() || null }));
		return Boolean(await save({ id: inspectionId, results, validar: true }));
	};

	return {
		inspectionId,
		groups,
		values,
		notes,
		/** Km ya guardado en esta inspección (al retomarla). */
		mileage: data?.inspectionForm.inspection?.mileage ?? null,
		loading: loading || (inspectionId === null && !failed),
		error: failed || Boolean(error),
		saving: saving || editing,
		setValue,
		setNote,
		finish,
	};
}

export type Checklist = ReturnType<typeof useChecklist>;
