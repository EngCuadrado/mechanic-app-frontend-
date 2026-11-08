import { useState } from "react";
import { useIntl } from "react-intl";
import { CheckIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import BottomSheet from "../../../shared/components/BottomSheet";
import IconButton from "../../../shared/components/IconButton";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { formatMoney, toNumber } from "../../../shared/utils/format";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { AGREGAR_SERVICIO, QUITAR_SERVICIO } from "../api/itemMutations";
import type { WorkOrderService } from "../types";

interface Props {
	workOrderId: number;
	services: WorkOrderService[];
	canEdit: boolean;
}

const REFETCH = { refetchQueries: ["GetWorkOrder"] };

export default function ServicesSection({ workOrderId, services, canEdit }: Props) {
	const intl = useIntl();
	const [open, setOpen] = useState(false);
	const [description, setDescription] = useState("");
	const [internalCost, setInternalCost] = useState("");
	const [price, setPrice] = useState("");
	const [add, adding] = useApiMutation(AGREGAR_SERVICIO, REFETCH);
	const [remove, removing] = useApiMutation(QUITAR_SERVICIO, REFETCH);

	const valid = description.trim() !== "" && toNumber(internalCost) !== null && toNumber(price) !== null;

	const submit = async () => {
		const ok = await add({
			workOrderId,
			description: description.trim(),
			internalCost: toNumber(internalCost),
			price: toNumber(price),
		});
		if (ok) {
			setOpen(false);
			setDescription("");
			setInternalCost("");
			setPrice("");
		}
	};

	return (
		<section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
			<div className="mb-3 flex items-center justify-between">
				<h2 className="font-semibold text-gray-800 dark:text-white/90">
					{intl.formatMessage({ id: "workOrder.services", defaultMessage: "Servicios" })}
				</h2>
				{canEdit && (
					<IconButton
						variant="outline"
						icon={<PlusIcon className="size-5" />}
						label={intl.formatMessage({ id: "workOrder.addService", defaultMessage: "Agregar servicio" })}
						onClick={() => setOpen(true)}
					/>
				)}
			</div>
			<ul className="flex flex-col gap-3">
				{services.map((s) => (
					<li key={s.workOrderServiceId} className="flex items-center justify-between gap-3">
						<div className="min-w-0">
							<p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{s.description}</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{[s.mechanic && `${s.mechanic.firstName ?? ""} ${s.mechanic.lastName ?? ""}`.trim(), formatMoney(s.price)]
									.filter(Boolean)
									.join(" · ")}
							</p>
						</div>
						{canEdit && (
							<IconButton
								disabled={removing}
								icon={<TrashIcon className="size-5 text-red-600" />}
								label={intl.formatMessage({ id: "common.remove", defaultMessage: "Quitar" })}
								onClick={() => remove({ workOrderServiceId: s.workOrderServiceId })}
							/>
						)}
					</li>
				))}
			</ul>
			<BottomSheet
				isOpen={open}
				onClose={() => setOpen(false)}
				title={intl.formatMessage({ id: "workOrder.addService", defaultMessage: "Agregar servicio" })}
			>
				<div className="flex flex-col gap-4">
					<div>
						<Label htmlFor="svc-desc">{intl.formatMessage({ id: "workOrder.serviceDescription", defaultMessage: "Descripción" })}</Label>
						<Input id="svc-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<Label htmlFor="svc-cost">{intl.formatMessage({ id: "workOrder.internalCost", defaultMessage: "Costo" })}</Label>
							<Input id="svc-cost" type="number" inputMode="decimal" value={internalCost} onChange={(e) => setInternalCost(e.target.value)} />
						</div>
						<div>
							<Label htmlFor="svc-price">{intl.formatMessage({ id: "workOrder.price", defaultMessage: "Precio" })}</Label>
							<Input id="svc-price" type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
						</div>
					</div>
					<IconButton
						variant="primary"
						showLabel
						disabled={!valid || adding}
						icon={<CheckIcon className="size-5" />}
						label={intl.formatMessage({ id: "common.save", defaultMessage: "Guardar" })}
						onClick={submit}
					/>
				</div>
			</BottomSheet>
		</section>
	);
}
