import { Link } from "react-router";
import { useIntl } from "react-intl";
import { ClockIcon, ExclamationTriangleIcon, UserIcon } from "@heroicons/react/24/outline";
import { elapsedMinutes, formatElapsed } from "../../../shared/utils/dates";
import { isReceptionIncomplete, orderPath } from "../readiness";
import type { WorkOrderSummary } from "../types";
import { StatusLabel } from "./StatusBadge";

const initials = (m: { firstName: string | null; lastName: string | null }) =>
	`${m.firstName?.[0] ?? ""}${m.lastName?.[0] ?? ""}`.toUpperCase() || "?";

/**
 * Tarjeta compacta de una orden: placa y estado, modelo, motivo, mecánicos y tiempo en el taller. Toda la tarjeta es tocable.
 * Con `onOpen` es un div (el tablero la arrastra: un <a> dentro de un arrastre provoca navegación nativa con recarga).
 */
export default function WorkOrderCard({ order, onOpen }: { order: WorkOrderSummary; onOpen?: () => void }) {
	const intl = useIntl();
	const model = order.vehicle?.model;
	const mechanics = order.assignedMechanics ?? [];
	const incomplete = isReceptionIncomplete(order);
	const className = "flex h-full flex-col gap-1.5 overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]";
	const body = (
		<>
			<div className="flex items-center justify-between gap-2">
				<p className="truncate text-lg font-bold tracking-wide text-gray-800 dark:text-white/90">{order.vehicle?.plate ?? "—"}</p>
				<StatusLabel status={order.currentStatus} />
			</div>
			<p className="truncate text-sm text-gray-500 dark:text-gray-400">
				{[model?.brand?.brandName, model?.modelName].filter(Boolean).join(" ")} · #{order.workOrderId}
			</p>
			{incomplete && (
				<p className="inline-flex items-center gap-1 text-sm font-medium text-warning-600 dark:text-warning-400">
					<ExclamationTriangleIcon className="size-4" aria-hidden />
					{intl.formatMessage({ id: "workOrder.receptionIncomplete", defaultMessage: "Recepción incompleta" })}
				</p>
			)}
			{order.reportedIssue && <p className="truncate text-sm text-gray-700 dark:text-gray-300">{order.reportedIssue}</p>}
			<div className="mt-auto flex items-center justify-between gap-3 pt-1 text-sm text-gray-500 dark:text-gray-400">
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
						<UserIcon className="size-4" aria-hidden />
						{intl.formatMessage({ id: "workOrder.noMechanic", defaultMessage: "Sin mecánico" })}
					</span>
				)}
				<span className="inline-flex items-center gap-1" title={intl.formatMessage({ id: "workOrder.timeInShop", defaultMessage: "Tiempo en el taller" })}>
					<ClockIcon className="size-4" aria-hidden />
					{formatElapsed(elapsedMinutes(order.entryTimestamp))}
				</span>
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
