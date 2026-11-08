import { useState } from "react";
import { useIntl } from "react-intl";
import { ClipboardDocumentListIcon, PlusIcon } from "@heroicons/react/24/outline";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import IconButton from "../../../shared/components/IconButton";
import { useLoadMoreList } from "../../../shared/hooks/useLoadMoreList";
import { GET_WORK_ORDERS } from "../api/queries";
import NewOrderSheet from "../components/NewOrderSheet";
import WorkOrderCard from "../components/WorkOrderCard";
import { WORK_ORDER_STATUSES, statusMessageId } from "../constants";
import type { WorkOrderSummary } from "../types";

export default function WorkOrdersPage() {
	const intl = useIntl();
	const [status, setStatus] = useState<string | null>(null);
	const [creating, setCreating] = useState(false);
	const { items, loading, error, hasMore, loadMore } = useLoadMoreList<WorkOrderSummary>({
		query: GET_WORK_ORDERS,
		field: "workOrders",
		idKey: "workOrderId",
		variables: {
			order: [{ workOrderId: "DESC" }],
			where: status ? { currentStatus: { eq: status } } : undefined,
		},
	});

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-4 p-4 pb-24">
			<div className="flex items-center justify-between gap-3">
				<h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
					{intl.formatMessage({ id: "workOrder.title", defaultMessage: "Órdenes de trabajo" })}
				</h1>
				<IconButton
					variant="primary"
					icon={<PlusIcon className="size-5" />}
					label={intl.formatMessage({ id: "workOrder.new", defaultMessage: "Nueva orden" })}
					onClick={() => setCreating(true)}
				/>
			</div>

			<div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
				{[null, ...WORK_ORDER_STATUSES].map((s) => (
					<button
						key={s ?? "all"}
						type="button"
						aria-pressed={status === s}
						onClick={() => setStatus(s)}
						className={`min-h-11 shrink-0 cursor-pointer rounded-full border px-4 text-sm font-medium ${
							status === s
								? "border-brand-500 bg-brand-500 text-white"
								: "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
						}`}
					>
						{s
							? intl.formatMessage({ id: statusMessageId(s), defaultMessage: s })
							: intl.formatMessage({ id: "common.all", defaultMessage: "Todas" })}
					</button>
				))}
			</div>

			{error && (
				<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-400">
					{intl.formatMessage({ id: "common.loadError", defaultMessage: "No se pudo cargar la información" })}
				</p>
			)}
			<ul className="grid gap-3 md:grid-cols-2">
				{items.map((o) => (
					<li key={o.workOrderId}>
						<WorkOrderCard order={o} />
					</li>
				))}
			</ul>
			{loading && <Loading size="sm" />}
			{!loading && !error && items.length === 0 && (
				<EmptyState
					icon={<ClipboardDocumentListIcon className="size-10" />}
					text={intl.formatMessage({ id: "workOrder.empty", defaultMessage: "No hay órdenes" })}
				/>
			)}
			{hasMore && (
				<button type="button" onClick={loadMore} className="min-h-11 cursor-pointer rounded-xl text-sm font-medium text-brand-500">
					{intl.formatMessage({ id: "common.loadMore", defaultMessage: "Ver más" })}
				</button>
			)}
			<NewOrderSheet isOpen={creating} onClose={() => setCreating(false)} />
		</div>
	);
}
