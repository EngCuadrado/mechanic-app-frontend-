import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { CREAR_INSPECCION, GET_INSPECTION_FORM, GUARDAR_RESULTADOS } from "../api/inspections";
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
 * Checklist de una inspección: la crea (una sola vez) si no existe, carga las categorías del backend y guarda por categoría.
 * Un switch (checkbox) empieza en "false"; el resto de ítems empieza sin respuesta.
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
				v[item.itemId] = value ?? (item.inputType === "checkbox" ? "false" : "");
				if (note) n[item.itemId] = note;
			}),
		);
		setValues(v);
		setNotes(n);
	}, [data, groups, inspectionId]);

	const setValue = useCallback((itemId: number, v: string) => setValues((p) => ({ ...p, [itemId]: v })), []);
	const setNote = useCallback((itemId: number, v: string) => setNotes((p) => ({ ...p, [itemId]: v })), []);

	const saveGroup = async (index: number, validar = false) => {
		const group = groups[index];
		if (!group || inspectionId === null) return true;
		const results = group.items
			.filter(({ item }) => isAnswered(values[item.itemId]))
			.map(({ item }) => ({ itemId: item.itemId, value: values[item.itemId], notes: notes[item.itemId]?.trim() || null }));
		if (results.length === 0 && !validar) return true;
		return Boolean(await save({ id: inspectionId, results, validar }));
	};

	/** Guarda la última categoría y pide al backend validar que no falte ningún obligatorio. */
	const finish = () => (groups.length === 0 ? Promise.resolve(true) : saveGroup(groups.length - 1, true));

	return {
		inspectionId,
		groups,
		values,
		notes,
		loading: loading || (inspectionId === null && !failed),
		error: failed || Boolean(error),
		saving,
		setValue,
		setNote,
		saveGroup,
		finish,
	};
}

export type Checklist = ReturnType<typeof useChecklist>;
