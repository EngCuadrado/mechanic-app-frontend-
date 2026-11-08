import { useState } from "react";
import { useIntl } from "react-intl";
import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import IconButton from "../../../shared/components/IconButton";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { formatMoney } from "../../../shared/utils/format";
import { AGREGAR_SERVICIO, EDITAR_SERVICIO, QUITAR_SERVICIO } from "../api/itemMutations";
import type { WorkOrderService } from "../types";
import ServiceSheet, { mechanicName, type ServiceValues } from "./ServiceSheet";

interface Props {
	workOrderId: number;
	services: WorkOrderService[];
	canEdit: boolean;
}

const REFETCH = { refetchQueries: ["GetWorkOrder", "GetWorkOrders"] };

export default function ServicesSection({ workOrderId, services, canEdit }: Props) {
	const intl = useIntl();
	// null = cerrado; "new" = crear; un servicio = editar ese.
	const [sheet, setSheet] = useState<"new" | WorkOrderService | null>(null);
	const [add, adding] = useApiMutation(AGREGAR_SERVICIO, REFETCH);
	const [edit, editing] = useApiMutation(EDITAR_SERVICIO, REFETCH);
	const [remove, removing] = useApiMutation(QUITAR_SERVICIO, REFETCH);

	const editing_ = sheet !== null && sheet !== "new" ? sheet : null;
	const initial: ServiceValues | undefined = editing_
		? {
				description: editing_.description ?? "",
				internalCost: editing_.internalCost ?? 0,
				price: editing_.price ?? 0,
				mechanic: editing_.mechanicId ? { mechanicId: editing_.mechanicId, ...editing_.mechanic! } : null,
			}
		: undefined;

	const submit = async (v: ServiceValues) => {
		const base = { description: v.description, internalCost: v.internalCost, price: v.price, mechanicId: v.mechanic?.mechanicId ?? null };
		const ok = editing_
			? await edit({ workOrderServiceId: editing_.workOrderServiceId, ...base })
			: await add({ workOrderId, ...base });
		if (ok) setSheet(null);
	};

	return (
		<section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
			<div className="mb-3 flex items-center justify-between">
				<h2 className="font-semibold text-gray-800 dark:text-white/90">
					{intl.formatMessage({ id: "workOrder.services", defaultMessage: "Servicios" })}
				</h2>
				{canEdit && (
					<IconButton
						variant="primary"
						showLabel
						icon={<PlusIcon className="size-5" />}
						label={intl.formatMessage({ id: "workOrder.addService", defaultMessage: "Agregar servicio" })}
						onClick={() => setSheet("new")}
					/>
				)}
			</div>
			<ul className="flex flex-col gap-3">
				{services.map((s) => (
					<li key={s.workOrderServiceId} className="flex items-center justify-between gap-3">
						<div className="min-w-0">
							<p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{s.description}</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{[
									s.mechanic
										? mechanicName({ mechanicId: s.mechanicId!, ...s.mechanic })
										: intl.formatMessage({ id: "workOrder.noMechanic", defaultMessage: "Sin mecánico" }),
									formatMoney(s.price),
								].join(" · ")}
							</p>
						</div>
						{canEdit && (
							<div className="flex items-center gap-1">
								<IconButton
									icon={<PencilSquareIcon className="size-5" />}
									label={intl.formatMessage({ id: "common.edit", defaultMessage: "Editar" })}
									onClick={() => setSheet(s)}
								/>
								<IconButton
									disabled={removing}
									icon={<TrashIcon className="size-5 text-red-600" />}
									label={intl.formatMessage({ id: "common.remove", defaultMessage: "Quitar" })}
									onClick={() => remove({ workOrderServiceId: s.workOrderServiceId })}
								/>
							</div>
						)}
					</li>
				))}
			</ul>
			<ServiceSheet
				isOpen={sheet !== null}
				onClose={() => setSheet(null)}
				initialValues={initial}
				saving={adding || editing}
				onSubmit={submit}
			/>
		</section>
	);
}
