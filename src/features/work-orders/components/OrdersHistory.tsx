import { useState } from "react";
import { useIntl } from "react-intl";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import Input from "../../../components/form/input/InputField";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useLoadMoreList } from "../../../shared/hooks/useLoadMoreList";
import { GET_WORK_ORDERS } from "../api/queries";
import StatusFilter from "./StatusFilter";
import WorkOrderCard from "./WorkOrderCard";
import { useStatusCounts } from "../hooks/useStatusCounts";
import type { WorkOrderSummary } from "../types";

/** Todas las órdenes (incluidas las cerradas) con filtro por estado y búsqueda por placa. */
export default function OrdersHistory() {
	const intl = useIntl();
	const [status, setStatus] = useState<string | null>(null);
	const [plate, setPlate] = useState("");
	const search = useDebouncedValue(plate.trim());
	const counts = useStatusCounts();
	const { items, loading, error, hasMore, loadMore } = useLoadMoreList<WorkOrderSummary>({
		query: GET_WORK_ORDERS,
		field: "workOrders",
		idKey: "workOrderId",
		variables: {
			order: [{ workOrderId: "DESC" }],
			where: {
				...(status && { currentStatus: { eq: status } }),
				...(search && { vehicle: { plate: { contains: search } } }),
			},
		},
	});

	return (
		<div className="flex flex-col gap-4">
			<Input
				type="search"
				placeholder={intl.formatMessage({ id: "workOrder.searchVehicle", defaultMessage: "Buscar por placa" })}
				value={plate}
				autoComplete="off"
				onChange={(e) => setPlate(e.target.value)}
			/>
			<StatusFilter counts={counts} value={status} onChange={setStatus} />

			{error && (
				<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-400">
					{intl.formatMessage({ id: "common.loadError", defaultMessage: "No se pudo cargar la información" })}
				</p>
			)}
			<ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
		</div>
	);
}
