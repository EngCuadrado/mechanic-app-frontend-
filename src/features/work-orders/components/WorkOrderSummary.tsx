import { useIntl } from "react-intl";
import { formatDateTime } from "../../../shared/utils/dates";
import { typeMessageId } from "../constants";
import type { WorkOrderDetail } from "../types";

/** Datos generales de la orden (solo lectura). */
export default function WorkOrderSummary({ order }: { order: WorkOrderDetail }) {
	const intl = useIntl();
	const rows: [string, string | null | undefined][] = [
		[intl.formatMessage({ id: "workOrder.type", defaultMessage: "Tipo" }), intl.formatMessage({ id: typeMessageId(order.type), defaultMessage: order.type })],
		[intl.formatMessage({ id: "workOrder.entry", defaultMessage: "Entrada" }), formatDateTime(order.entryTimestamp)],
		[intl.formatMessage({ id: "workOrder.company", defaultMessage: "Empresa" }), order.company?.name],
	];
	return (
		<section className="rounded-2xl border border-gray-200 p-4 text-sm dark:border-gray-800">
			<dl className="flex flex-col gap-2">
				{rows.filter(([, v]) => v).map(([k, v]) => (
					<div key={k} className="flex justify-between gap-3">
						<dt className="text-gray-500 dark:text-gray-400">{k}</dt>
						<dd className="text-right font-medium text-gray-800 dark:text-white/90">{v}</dd>
					</div>
				))}
			</dl>
			{order.reportedIssue && <p className="mt-3 border-t border-dashed border-gray-200 pt-3 text-gray-700 dark:border-gray-800 dark:text-gray-300">{order.reportedIssue}</p>}
			{order.notes && <p className="mt-1 text-gray-500 dark:text-gray-400">{order.notes}</p>}
		</section>
	);
}
