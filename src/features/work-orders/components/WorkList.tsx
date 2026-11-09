import { useState } from "react";
import { useIntl } from "react-intl";
import { CubeIcon, TrashIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import IconButton from "../../../shared/components/IconButton";
import QuantityStepper from "../../../shared/components/QuantityStepper";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { formatMoney } from "../../../shared/utils/format";
import { QUITAR_SERVICIO } from "../api/itemMutations";
import { usePartsDraft } from "../hooks/usePartsDraft";
import type { WorkOrderDetail, WorkOrderService } from "../types";

interface Props {
	order: WorkOrderDetail;
	canEdit: boolean;
	onEditService: (service: WorkOrderService) => void;
}

type Removing = { kind: "service"; id: number } | { kind: "part"; key: string } | null;

const ICON = "flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300 [&>svg]:size-5";

/** Una sola lista de Trabajo: servicios y repuestos juntos, con el total del backend. */
export default function WorkList({ order, canEdit, onEditService }: Props) {
	const intl = useIntl();
	const [removing, setRemoving] = useState<Removing>(null);
	const { rows, setQuantity, remove } = usePartsDraft(order.workOrderId, order.parts);
	const [removeService, removingService] = useApiMutation(QUITAR_SERVICIO, { refetchQueries: ["GetWorkOrder", "GetWorkOrders"] });

	const confirm = async () => {
		if (removing?.kind === "service") await removeService({ workOrderServiceId: removing.id });
		else if (removing) remove(removing.key);
		setRemoving(null);
	};
	const trash = (r: NonNullable<Removing>) => (
		<IconButton
			variant="ghost"
			icon={<TrashIcon className="size-5 text-red-600" />}
			label={intl.formatMessage({ id: "common.remove", defaultMessage: "Quitar" })}
			onClick={() => setRemoving(r)}
		/>
	);

	const empty = order.services.length === 0 && rows.length === 0;
	return (
		<section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
			<h2 className="mb-3 font-semibold text-gray-800 dark:text-white/90">{intl.formatMessage({ id: "workOrder.work", defaultMessage: "Trabajo" })}</h2>
			{empty ? (
				<p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">{intl.formatMessage({ id: "workOrder.work.empty", defaultMessage: "Aún no hay trabajo" })}</p>
			) : (
				<ul className="flex flex-col gap-3">
					{order.services.map((s) => (
						<li key={`s${s.workOrderServiceId}`} className="flex items-center gap-3">
							<span className={ICON} aria-hidden><WrenchScrewdriverIcon /></span>
							<button
								type="button"
								disabled={!canEdit}
								onClick={() => onEditService(s)}
								className="min-h-11 min-w-0 flex-1 cursor-pointer text-left disabled:cursor-default"
							>
								<span className="block truncate text-sm font-medium text-gray-800 dark:text-white/90">{s.description}</span>
								<span className="block truncate text-xs text-gray-500 dark:text-gray-400">
									{[s.mechanic && `${s.mechanic.firstName ?? ""} ${s.mechanic.lastName ?? ""}`.trim(), formatMoney(s.price)].filter(Boolean).join(" · ")}
								</span>
							</button>
							{canEdit && trash({ kind: "service", id: s.workOrderServiceId })}
						</li>
					))}
					{rows.map((r) => (
						<li key={r.key} className="flex flex-wrap items-center gap-x-3 gap-y-2">
							<span className={ICON} aria-hidden><CubeIcon /></span>
							<div className="min-w-32 flex-1">
								<p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{r.name}</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">{formatMoney(r.unitPrice)} × {r.quantity}</p>
							</div>
							{canEdit && (
								<div className="ml-auto flex items-center gap-1">
									<QuantityStepper value={r.quantity} onChange={(q) => setQuantity(r.key, q)} />
									{trash({ kind: "part", key: r.key })}
								</div>
							)}
						</li>
					))}
				</ul>
			)}
			<div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-800">
				<span className="text-gray-500 dark:text-gray-400">{intl.formatMessage({ id: "workOrder.total", defaultMessage: "Total" })}</span>
				<span className="text-xl font-bold text-gray-800 dark:text-white/90">{formatMoney(order.totalBilledPrice)}</span>
			</div>
			<ConfirmDialog
				isOpen={removing !== null}
				danger
				loading={removingService}
				title={intl.formatMessage(removing?.kind === "service" ? { id: "workOrder.removeService.title", defaultMessage: "Quitar servicio" } : { id: "workOrder.removePart.title", defaultMessage: "Quitar repuesto" })}
				message={intl.formatMessage(removing?.kind === "service" ? { id: "workOrder.removeService.message", defaultMessage: "Se quita de la orden y del total." } : { id: "workOrder.removePart.message", defaultMessage: "Se devuelve al inventario." })}
				confirmLabel={intl.formatMessage({ id: "common.remove", defaultMessage: "Quitar" })}
				onConfirm={confirm}
				onClose={() => setRemoving(null)}
			/>
		</section>
	);
}
