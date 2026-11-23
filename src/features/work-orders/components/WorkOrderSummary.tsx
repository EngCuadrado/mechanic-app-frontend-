import { useIntl } from "react-intl";
import { elapsedMinutes, formatDateTime, formatElapsed } from "../../../shared/utils/dates";
import { formatMoney } from "../../../shared/utils/format";
import { isClosed, typeMessageId } from "../constants";
import type { WorkOrderDetail } from "../types";

/** Datos del carro y de la orden (solo lectura): tipo, entrada, km, tiempo en taller, empresa y total (discreto). */
export default function WorkOrderSummary({ order }: { order: WorkOrderDetail }) {
	const intl = useIntl();
	const t = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage });
	const entryKm = order.inspections.find((i) => i.inspectionType === "Entrada")?.mileage;
	const rows: [string, string | null | undefined][] = [
		[t("workOrder.type", "Tipo"), intl.formatMessage({ id: typeMessageId(order.type), defaultMessage: order.type })],
		[t("workOrder.entry", "Entrada"), formatDateTime(order.entryTimestamp)],
		[t("workOrder.entryMileage", "Km de entrada"), entryKm != null ? `${intl.formatNumber(entryKm)} km` : null],
		[t("workOrder.timeInShop", "Tiempo en el taller"), isClosed(order.currentStatus) ? null : formatElapsed(elapsedMinutes(order.entryTimestamp))],
		[t("workOrder.exit", "Salida"), order.exitTimestamp ? formatDateTime(order.exitTimestamp) : null],
		[t("workOrder.company", "Empresa"), order.company?.name],
		[t("workOrder.total", "Total"), formatMoney(order.totalBilledPrice)],
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
