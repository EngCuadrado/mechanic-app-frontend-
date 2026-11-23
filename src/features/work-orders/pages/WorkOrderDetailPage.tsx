import { useState } from "react";
import { Link, useParams } from "react-router";
import { useIntl } from "react-intl";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import AddWorkSheet from "../components/AddWorkSheet";
import CancelOrderButton from "../components/CancelOrderButton";
import RecordRows from "../components/RecordRows";
import StatusActions from "../components/StatusActions";
import StatusBadge from "../components/StatusBadge";
import StatusProgress from "../components/StatusProgress";
import WorkList from "../components/WorkList";
import WorkOrderSummary from "../components/WorkOrderSummary";
import { isClosed } from "../constants";
import type { WorkOrderService } from "../types";
import { useWorkOrder } from "../hooks/useWorkOrder";

/**
 * Orden: encabezado con estado y cancelar; en tablet dos paneles (trabajo | carro y registro), en vertical apilado
 * (carro → trabajo → registro). Barra fija con "Agregar" y el siguiente estado.
 */
export default function WorkOrderDetailPage() {
	const intl = useIntl();
	const id = Number(useParams().id);
	const { order, loading, error } = useWorkOrder(id);
	// "new" = hoja Agregar; un servicio = editar ese; null = cerrada.
	const [sheet, setSheet] = useState<"new" | WorkOrderService | null>(null);

	if (loading && !order) return <Loading />;
	if (error || !order)
		return (
			<EmptyState
				text={intl.formatMessage({
					id: error ? "common.loadError" : "workOrder.notFound",
					defaultMessage: error ? "No se pudo cargar la información" : "Orden no encontrada",
				})}
			/>
		);

	const closed = isClosed(order.currentStatus);
	const model = order.vehicle?.model;
	const back = intl.formatMessage({ id: "common.back", defaultMessage: "Volver" });

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-4 p-4 pb-28 lg:max-w-none">
			<header className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-3 dark:border-gray-800 lg:flex-row lg:items-center lg:gap-6">
				<div className="flex min-w-0 items-center gap-3 lg:shrink-0">
					<Link
						to="/ordenes"
						aria-label={back}
						title={back}
						className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
					>
						<ArrowLeftIcon className="size-5" />
					</Link>
					<div className="min-w-0 flex-1">
						<h1 className="truncate text-2xl font-bold tracking-wide text-gray-800 dark:text-white/90">{order.vehicle?.plate}</h1>
						<p className="truncate text-sm text-gray-500 dark:text-gray-400">
							{[model?.brand?.brandName, model?.modelName].filter(Boolean).join(" ")} · #{order.workOrderId}
						</p>
					</div>
					<StatusBadge status={order.currentStatus} />
				</div>
				<div className="min-w-0 lg:flex-1">
					<StatusProgress status={order.currentStatus} />
				</div>
				<div className="flex justify-end lg:shrink-0">
					<CancelOrderButton workOrderId={order.workOrderId} status={order.currentStatus} />
				</div>
			</header>

			<div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
				<div className="lg:col-start-2 lg:row-start-1">
					<WorkOrderSummary order={order} />
				</div>
				<div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
					<WorkList order={order} canEdit={!closed} onEditService={setSheet} />
				</div>
				<div className="lg:col-start-2 lg:row-start-2">
					<RecordRows order={order} />
				</div>
			</div>

			<StatusActions workOrderId={order.workOrderId} status={order.currentStatus} onAdd={closed ? undefined : () => setSheet("new")} />
			<AddWorkSheet
				isOpen={sheet !== null}
				onClose={() => setSheet(null)}
				workOrderId={order.workOrderId}
				parts={order.parts}
				editService={sheet !== null && sheet !== "new" ? sheet : null}
			/>
		</div>
	);
}
