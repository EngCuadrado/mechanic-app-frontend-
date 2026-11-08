import { useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@apollo/client/react";
import { useIntl } from "react-intl";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import IconButton from "../../../shared/components/IconButton";
import { useLoadMoreList } from "../../../shared/hooks/useLoadMoreList";
import { formatDateTime } from "../../../shared/utils/dates";
import { formatMoney } from "../../../shared/utils/format";
import { GET_INVENTORY_MOVEMENTS, GET_INVENTORY_PART } from "../api/movements";
import MovementSheet from "../components/MovementSheet";
import StockCheckBadge from "../components/StockCheckBadge";
import type { InventoryMovement } from "../types";

export default function MovementsPage() {
	const intl = useIntl();
	const partId = Number(useParams().id);
	const [open, setOpen] = useState(false);
	const { data } = useQuery<{ inventoryParts: { nodes: { name: string; stockQuantity: number }[] } }>(GET_INVENTORY_PART, {
		variables: { id: partId },
	});
	const part = data?.inventoryParts.nodes[0];
	const { items, loading, error, hasMore, loadMore } = useLoadMoreList<InventoryMovement>({
		query: GET_INVENTORY_MOVEMENTS,
		field: "inventoryMovements",
		idKey: "movementId",
		variables: { partId },
	});

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-4 p-4 pb-24">
			<div className="flex items-center gap-3">
				<Link
					to="/inventory"
					aria-label={intl.formatMessage({ id: "common.back", defaultMessage: "Volver" })}
					title={intl.formatMessage({ id: "common.back", defaultMessage: "Volver" })}
					className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
				>
					<ArrowLeftIcon className="size-5" />
				</Link>
				<div className="min-w-0 flex-1">
					<h1 className="truncate text-lg font-semibold text-gray-800 dark:text-white/90">{part?.name}</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{intl.formatMessage({ id: "inventory.stockShort", defaultMessage: "Stock" })}: {part?.stockQuantity} · <StockCheckBadge />
					</p>
				</div>
				<IconButton
					variant="primary"
					icon={<PlusIcon className="size-5" />}
					label={intl.formatMessage({ id: "inventory.movement.new", defaultMessage: "Registrar movimiento" })}
					onClick={() => setOpen(true)}
				/>
			</div>

			{error && (
				<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-400">
					{intl.formatMessage({ id: "common.loadError", defaultMessage: "No se pudo cargar la información" })}
				</p>
			)}
			<ul className="flex flex-col gap-2">
				{items.map((m) => (
					<li key={m.movementId} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-800">
						<div>
							<p className="text-sm font-medium text-gray-800 dark:text-white/90">
								{intl.formatMessage({ id: `inventory.movement.type.${m.movementType}`, defaultMessage: m.movementType })}
								{m.workOrderId && (
									<Link to={`/ordenes/${m.workOrderId}`} className="ml-2 text-brand-500">#{m.workOrderId}</Link>
								)}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{formatDateTime(m.createdAt)}
								{m.unitCost !== null && ` · ${formatMoney(m.unitCost)}`}
							</p>
						</div>
						<span className={`text-base font-semibold ${m.quantity > 0 ? "text-emerald-600" : "text-red-600"}`}>
							{m.quantity > 0 ? `+${m.quantity}` : m.quantity}
						</span>
					</li>
				))}
			</ul>
			{loading && <Loading size="sm" />}
			{!loading && !error && items.length === 0 && (
				<EmptyState text={intl.formatMessage({ id: "inventory.movement.empty", defaultMessage: "Sin movimientos" })} />
			)}
			{hasMore && (
				<button type="button" onClick={loadMore} className="min-h-11 cursor-pointer rounded-xl text-sm font-medium text-brand-500">
					{intl.formatMessage({ id: "common.loadMore", defaultMessage: "Ver más" })}
				</button>
			)}
			<MovementSheet partId={partId} isOpen={open} onClose={() => setOpen(false)} />
		</div>
	);
}
