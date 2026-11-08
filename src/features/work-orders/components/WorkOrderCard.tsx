import { Link } from "react-router";
import { useIntl } from "react-intl";
import { formatDateTime } from "../../../shared/utils/dates";
import { formatMoney } from "../../../shared/utils/format";
import { typeMessageId } from "../constants";
import type { WorkOrderSummary } from "../types";
import StatusBadge from "./StatusBadge";

/** Tarjeta de una orden para listas en pantalla chica (toda la tarjeta es el área de toque). */
export default function WorkOrderCard({ order }: { order: WorkOrderSummary }) {
	const intl = useIntl();
	const model = order.vehicle?.model;
	return (
		<Link
			to={`/ordenes/${order.workOrderId}`}
			className="block min-h-11 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate text-base font-semibold text-gray-800 dark:text-white/90">
						#{order.workOrderId} · {order.vehicle?.plate ?? "—"}
					</p>
					<p className="truncate text-sm text-gray-500 dark:text-gray-400">
						{[model?.brand?.brandName, model?.modelName].filter(Boolean).join(" ")}
					</p>
				</div>
				<StatusBadge status={order.currentStatus} />
			</div>
			<div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
				<span>
					{intl.formatMessage({ id: typeMessageId(order.type), defaultMessage: order.type })} · {formatDateTime(order.entryTimestamp)}
				</span>
				<span className="font-medium text-gray-700 dark:text-gray-300">{formatMoney(order.totalBilledPrice)}</span>
			</div>
		</Link>
	);
}
