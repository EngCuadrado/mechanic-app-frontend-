import { useState } from "react";
import { useIntl } from "react-intl";
import ChoiceChips from "../../../shared/components/ChoiceChips";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toNumber } from "../../../shared/utils/format";
import { serviceMissing } from "../addWork";
import { isExternalService, SERVICE_CATALOG, serviceMessageId } from "../constants";
import MechanicChips from "./MechanicChips";

export interface ServiceInitial {
	description: string;
	price: number | null;
	internalCost: number | null;
	mechanicId: number | null;
}

/** Estado del formulario de servicio. La hoja lo usa para el botón fijo (qué falta, qué se manda). */
export function useServiceDraft(initial?: ServiceInitial) {
	const intl = useIntl();
	const labelOf = (k: string) => intl.formatMessage({ id: serviceMessageId(k), defaultMessage: k });
	// La descripción guardada es el texto del servicio; se vuelve a su clave del catálogo si coincide.
	const initialKey = initial ? (SERVICE_CATALOG.find((k) => labelOf(k) === initial.description) ?? initial.description) : null;
	const [key, setKey] = useState<string | null>(initialKey);
	const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : "");
	const [cost, setCost] = useState(initial?.internalCost ? String(initial.internalCost) : "");
	const [mechanicId, setMechanicId] = useState<number | null>(initial?.mechanicId ?? null);

	const external = isExternalService(key);
	const missing = serviceMissing({ key, price: toNumber(price), cost: toNumber(cost) });
	const description = key && (SERVICE_CATALOG as readonly string[]).includes(key) ? labelOf(key) : (key ?? "");
	return {
		key, setKey, price, setPrice, cost, setCost, mechanicId, setMechanicId, external, missing,
		values: { description, price: toNumber(price) ?? 0, internalCost: external ? (toNumber(cost) ?? 0) : 0, mechanicId },
		customKey: initialKey && !(SERVICE_CATALOG as readonly string[]).includes(initialKey) ? initialKey : null,
	};
}

/** Campos del servicio: elegir servicio, precio, costo (solo externos) y mecánico. Sin texto libre. */
export default function ServiceForm({ draft }: { draft: ReturnType<typeof useServiceDraft> }) {
	const intl = useIntl();
	const options: { value: string; label: string }[] = SERVICE_CATALOG.map((k) => ({ value: k, label: intl.formatMessage({ id: serviceMessageId(k), defaultMessage: k }) }));
	if (draft.customKey) options.push({ value: draft.customKey, label: draft.customKey });
	return (
		<div className="flex flex-col gap-5">
			<ChoiceChips
				ariaLabel={intl.formatMessage({ id: "workOrder.add.service", defaultMessage: "Servicio" })}
				value={draft.key}
				onChange={draft.setKey}
				options={options}
			/>
			<div className={`grid gap-3 ${draft.external ? "grid-cols-2" : "grid-cols-1"}`}>
				<div>
					<Label htmlFor="svc-price">{intl.formatMessage({ id: "workOrder.price", defaultMessage: "Precio" })}</Label>
					<Input id="svc-price" type="number" inputMode="decimal" value={draft.price} onChange={(e) => draft.setPrice(e.target.value)} />
				</div>
				{draft.external && (
					<div>
						<Label htmlFor="svc-cost">{intl.formatMessage({ id: "workOrder.internalCost", defaultMessage: "Costo" })}</Label>
						<Input id="svc-cost" type="number" inputMode="decimal" value={draft.cost} onChange={(e) => draft.setCost(e.target.value)} />
					</div>
				)}
			</div>
			<div className="flex flex-col gap-2">
				<Label>{intl.formatMessage({ id: "workOrder.mechanic", defaultMessage: "Mecánico" })}</Label>
				<MechanicChips value={draft.mechanicId} onChange={draft.setMechanicId} />
			</div>
		</div>
	);
}
