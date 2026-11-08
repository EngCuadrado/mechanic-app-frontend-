import { Link } from "react-router";
import { useIntl } from "react-intl";
import { ClockIcon, ExclamationTriangleIcon, UserIcon } from "@heroicons/react/24/outline";
import { elapsedMinutes, formatElapsed } from "../../../shared/utils/dates";
import { formatMoney } from "../../../shared/utils/format";
import { isClosed, OVERDUE_MINUTES, typeMessageId } from "../constants";
import { isReceptionIncomplete, orderPath } from "../readiness";
import type { WorkOrderSummary } from "../types";
import StatusBadge, { statusStyle } from "./StatusBadge";

const initials = (m: { firstName: string | null; lastName: string | null }) =>
	`${m.firstName?.[0] ?? ""}${m.lastName?.[0] ?? ""}`.toUpperCase() || "?";

/**
 * Tarjeta de una orden: franja de color por estado, problema, mecánicos, antigüedad y total. Toda la tarjeta es tocable.
 * Con `onOpen` es un div (el tablero la arrastra: un <a> dentro de un arrastre provoca navegación nativa con recarga).
 */
export default function WorkOrderCard({ order, onOpen }: { order: WorkOrderSummary; onOpen?: () => void }) {
	const intl = useIntl();
	const model = order.vehicle?.model;
	const mechanics = order.assignedMechanics ?? [];
	const minutes = elapsedMinutes(order.entryTimestamp);
	const overdue = !isClosed(order.currentStatus) && minutes > OVERDUE_MINUTES;
	const incomplete = isReceptionIncomplete(order);
	const services = order.services.map((s) => s.description).filter(Boolean);
	const className = "relative flex h-full min-h-11 flex-col gap-2.5 overflow-hidden rounded-2xl border border-gray-200 bg-white py-3.5 pr-3.5 pl-5 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]";
	const body = (
		<>
			<span aria-hidden className={`absolute inset-y-0 left-0 w-2 ${statusStyle(order.currentStatus).stripe}`} />
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate text-xl font-bold tracking-wide text-gray-800 dark:text-white/90">{order.vehicle?.plate ?? "—"}</p>
					<p className="truncate text-sm text-gray-500 dark:text-gray-400">
						{[model?.brand?.brandName, model?.modelName].filter(Boolean).join(" ")} · #{order.workOrderId}
					</p>
				</div>
				<StatusBadge status={order.currentStatus} />
			</div>
			{incomplete && (
				<p className="inline-flex items-center gap-1 text-sm font-medium text-warning-600 dark:text-warning-400">
					<ExclamationTriangleIcon className="size-4" aria-hidden />
					{intl.formatMessage({ id: "workOrder.receptionIncomplete", defaultMessage: "Recepción incompleta" })}
				</p>
			)}
			{order.reportedIssue && <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-300">{order.reportedIssue}</p>}
			{services.length > 0 && (
				<p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
					{services.slice(0, 2).join(" · ")}
					{services.length > 2 && ` +${services.length - 2}`}
				</p>
			)}
			<div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
				{mechanics.length > 0 ? (
					<span className="flex -space-x-1.5" aria-label={mechanics.map((m) => `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()).join(", ")}>
						{mechanics.slice(0, 3).map((m) => (
							<span
								key={m.mechanicId}
								className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-brand-50 text-xs font-semibold text-brand-500 dark:border-gray-900 dark:bg-brand-500/20"
							>
								{initials(m)}
							</span>
						))}
					</span>
				) : (
					<span className="inline-flex items-center gap-1">
						<UserIcon className="size-4" />
						{intl.formatMessage({ id: "workOrder.noMechanic", defaultMessage: "Sin mecánico" })}
					</span>
				)}
				<span>{intl.formatMessage({ id: typeMessageId(order.type), defaultMessage: order.type })}</span>
				<span className={`inline-flex items-center gap-1 ${overdue ? "font-semibold text-error-600 dark:text-error-400" : ""}`}>
					<ClockIcon className="size-4" aria-hidden />
					{formatElapsed(minutes)}
					{overdue && ` · ${intl.formatMessage({ id: "workOrder.overdue", defaultMessage: "Atrasada" })}`}
				</span>
				<span className="font-semibold text-gray-800 dark:text-white/90">{formatMoney(order.totalBilledPrice)}</span>
			</div>
		</>
	);
	return onOpen ? (
		<div role="link" tabIndex={0} onClick={onOpen} onKeyDown={(e) => e.key === "Enter" && onOpen()} className={`${className} cursor-pointer`}>
			{body}
		</div>
	) : (
		<Link to={orderPath(order)} className={className}>
			{body}
		</Link>
	);
}
