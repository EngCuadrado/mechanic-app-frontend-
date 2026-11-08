import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useIntl } from "react-intl";
import { CheckIcon } from "@heroicons/react/24/outline";
import Loading from "../../../components/ui/loading/Loading";
import ActionBar from "../../../shared/components/ActionBar";
import EmptyState from "../../../shared/components/EmptyState";
import IconButton from "../../../shared/components/IconButton";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { GET_INSPECTION_FORM, GUARDAR_RESULTADOS } from "../api/inspections";
import type { InspectionFormData } from "../types";
import { FIELD_REGISTRY } from "./fields";

/** Formulario del checklist agrupado por categoría. Guarda solo lo que cambió, en un lote. */
export default function InspectionFormView({ inspectionId, readOnly }: { inspectionId: number; readOnly: boolean }) {
	const intl = useIntl();
	const { data, loading, error } = useQuery<{ inspectionForm: InspectionFormData }>(GET_INSPECTION_FORM, {
		variables: { id: inspectionId },
	});
	const [values, setValues] = useState<Record<number, string>>({});
	const [dirty, setDirty] = useState<Set<number>>(new Set());
	const [save, saving] = useApiMutation(GUARDAR_RESULTADOS, { refetchQueries: ["GetInspectionForm"] });

	useEffect(() => {
		if (!data) return;
		const initial: Record<number, string> = {};
		data.inspectionForm.groups.forEach((g) => g.items.forEach((i) => (initial[i.item.itemId] = i.value ?? "")));
		setValues(initial);
		setDirty(new Set());
	}, [data]);

	if (loading && !data) return <Loading />;
	if (error || !data)
		return <EmptyState text={intl.formatMessage({ id: "common.loadError", defaultMessage: "No se pudo cargar la información" })} />;

	const change = (id: number, v: string) => {
		setValues((p) => ({ ...p, [id]: v }));
		setDirty((p) => new Set(p).add(id));
	};

	const submit = () =>
		save({
			id: inspectionId,
			validar: false,
			results: [...dirty].map((itemId) => ({ itemId, value: values[itemId] === "" ? null : values[itemId], notes: null })),
		});

	return (
		<div className="flex flex-col gap-4 pb-24">
			{data.inspectionForm.groups.map((g) => (
				<section key={g.category?.name ?? "otros"} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
					<h2 className="mb-3 font-semibold text-gray-800 dark:text-white/90">{g.category?.name}</h2>
					<ul className="flex flex-col gap-4">
						{g.items.map(({ item }) => {
							const Field = FIELD_REGISTRY[item.inputType] ?? FIELD_REGISTRY.text;
							return (
								<li key={item.itemId} className="flex flex-col gap-2">
									<label htmlFor={`item-${item.itemId}`} className="text-sm text-gray-700 dark:text-gray-300">
										{item.name}
										{item.isRequired && <span aria-hidden> *</span>}
									</label>
									{Field({ item, value: values[item.itemId] ?? "", onChange: (v) => change(item.itemId, v), disabled: readOnly })}
								</li>
							);
						})}
					</ul>
				</section>
			))}
			{!readOnly && (
				<ActionBar>
					<IconButton
						variant="primary"
						showLabel
						disabled={dirty.size === 0 || saving}
						icon={<CheckIcon className="size-5" />}
						label={intl.formatMessage({ id: "common.save", defaultMessage: "Guardar" })}
						onClick={submit}
					/>
				</ActionBar>
			)}
		</div>
	);
}
