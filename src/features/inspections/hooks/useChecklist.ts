import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { CREAR_INSPECCION, GET_INSPECTION_FORM, GUARDAR_RESULTADOS } from "../api/inspections";
import { activeOnly, initialValues, toResults } from "../checklist";
import type { FormGroup, InspectionFormData } from "../types";

interface Args {
	/** null = la orden aún no existe: solo se carga el formulario vacío y las respuestas se guardan después (ver `results`). */
	workOrderId: number | null;
	type: "Entrada" | "Salida";
	/** Si la orden ya tiene esta inspección se reutiliza (retomar una recepción). */
	existingId?: number | null;
}

const EMPTY: FormGroup[] = [];

/**
 * Checklist de una inspección, por excepción: los sí/no empiezan en "true" (bien) y solo se tocan los que tienen problema.
 * Con orden, crea la inspección (una sola vez) si no existe y `finish` guarda todo en un lote.
 */
export function useChecklist({ workOrderId, type, existingId = null }: Args) {
	const [inspectionId, setInspectionId] = useState<number | null>(existingId);
	const [failed, setFailed] = useState(false);
	const [values, setValues] = useState<Record<number, string>>({});
	const [notes, setNotes] = useState<Record<number, string>>({});
	const creating = useRef(false);
	const initialized = useRef<string | null>(null);
	const [create] = useApiMutation<{ crearInspeccion: { vehicleInspectionId: number } }>(CREAR_INSPECCION);
	const [save, saving] = useApiMutation(GUARDAR_RESULTADOS);

	useEffect(() => {
		if (workOrderId === null || inspectionId !== null || creating.current) return;
		creating.current = true; // evita crear dos veces (doble render o doble toque)
		create({ workOrderId, inspectionType: type }).then((d) => {
			if (d) setInspectionId(d.crearInspeccion.vehicleInspectionId);
			else setFailed(true);
		});
	}, [inspectionId, create, workOrderId, type]);

	const waiting = workOrderId !== null && inspectionId === null;
	const { data, loading, error } = useQuery<{ inspectionForm: InspectionFormData }>(GET_INSPECTION_FORM, {
		variables: { id: inspectionId, type },
		skip: waiting,
		fetchPolicy: "network-only",
	});
	const groups = useMemo(() => (data ? activeOnly(data.inspectionForm.groups) : EMPTY), [data]);

	useEffect(() => {
		const key = `${inspectionId}`;
		if (!data || initialized.current === key) return;
		initialized.current = key;
		const start = initialValues(groups);
		setValues(start.values);
		setNotes(start.notes);
	}, [data, groups, inspectionId]);

	const setValue = useCallback((itemId: number, v: string) => setValues((p) => ({ ...p, [itemId]: v })), []);
	const setNote = useCallback((itemId: number, v: string) => setNotes((p) => ({ ...p, [itemId]: v })), []);

	/** Guarda todas las respuestas en un lote; el backend valida que no falte ningún obligatorio. */
	const finish = async () => {
		if (inspectionId === null) return false;
		if (groups.length === 0) return true;
		return Boolean(await save({ id: inspectionId, results: toResults(groups, values, notes), validar: true }));
	};

	return {
		inspectionId,
		groups,
		values,
		notes,
		/** Respuestas listas para guardarResultadosInspeccion (cuando la orden se crea después). */
		results: () => toResults(groups, values, notes),
		loading: loading || (waiting && !failed),
		error: failed || Boolean(error),
		saving,
		setValue,
		setNote,
		finish,
	};
}

export type Checklist = ReturnType<typeof useChecklist>;
