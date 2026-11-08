import { Link, useParams } from "react-router";
import { useIntl } from "react-intl";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import { formatDateTime } from "../../../shared/utils/dates";
import { formatMoney } from "../../../shared/utils/format";
import { InspectionsSection } from "../../inspections";
import { PhotosSection } from "../../photos";
import HandoverSection from "../components/HandoverSection";
import PartsSection from "../components/PartsSection";
import ServicesSection from "../components/ServicesSection";
import StatusActions from "../components/StatusActions";
import StatusBadge from "../components/StatusBadge";
import { isClosed, isHandover, typeMessageId } from "../constants";
import { useWorkOrder } from "../hooks/useWorkOrder";

export default function WorkOrderDetailPage() {
	const intl = useIntl();
	const id = Number(useParams().id);
	const { order, loading, error } = useWorkOrder(id);

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
	const cancelled = order.currentStatus === "Cancelado";
	const model = order.vehicle?.model;

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-4 p-4 pb-28">
			<div className="flex items-center gap-3">
				<Link
					to="/ordenes"
					aria-label={intl.formatMessage({ id: "common.back", defaultMessage: "Volver" })}
					title={intl.formatMessage({ id: "common.back", defaultMessage: "Volver" })}
					className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
				>
					<ArrowLeftIcon className="size-5" />
				</Link>
				<div className="min-w-0 flex-1">
					<h1 className="truncate text-lg font-semibold text-gray-800 dark:text-white/90">
						#{order.workOrderId} · {order.vehicle?.plate}
					</h1>
					<p className="truncate text-sm text-gray-500 dark:text-gray-400">
						{[model?.brand?.brandName, model?.modelName].filter(Boolean).join(" ")}
					</p>
				</div>
				<StatusBadge status={order.currentStatus} />
			</div>

			<section className="rounded-2xl border border-gray-200 p-4 text-sm dark:border-gray-800">
				<p className="text-gray-800 dark:text-white/90">
					{intl.formatMessage({ id: typeMessageId(order.type), defaultMessage: order.type })} · {formatDateTime(order.entryTimestamp)}
				</p>
				{order.reportedIssue && <p className="mt-2 text-gray-600 dark:text-gray-300">{order.reportedIssue}</p>}
				{order.notes && <p className="mt-1 text-gray-500 dark:text-gray-400">{order.notes}</p>}
				{order.company?.name && <p className="mt-1 text-gray-500 dark:text-gray-400">{order.company.name}</p>}
			</section>

			{isHandover(order.type) && <HandoverSection key={order.workOrderId} order={order} readOnly={closed} />}

			<PartsSection
				workOrderId={order.workOrderId}
				parts={order.parts}
				canAdd={!closed}
				canEdit={!closed}
				canRemove={!closed || cancelled}
			/>
			<ServicesSection workOrderId={order.workOrderId} services={order.services} canEdit={!closed} />

			<InspectionsSection workOrderId={order.workOrderId} inspections={order.inspections} canCreate={!closed} />
			<PhotosSection workOrderId={order.workOrderId} canAdd={!closed} canDelete={order.currentStatus !== "Entregado"} />

			<section className="flex justify-between rounded-2xl bg-gray-50 p-4 text-sm dark:bg-white/[0.03]">
				<span className="text-gray-500 dark:text-gray-400">
					{intl.formatMessage({ id: "workOrder.total", defaultMessage: "Total" })}
				</span>
				<span className="font-semibold text-gray-800 dark:text-white/90">{formatMoney(order.totalBilledPrice)}</span>
			</section>

			<StatusActions workOrderId={order.workOrderId} status={order.currentStatus} />
		</div>
	);
}
