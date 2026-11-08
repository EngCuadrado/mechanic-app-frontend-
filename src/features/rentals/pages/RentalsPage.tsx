import { useIntl } from "react-intl";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import { useLoadMoreList } from "../../../shared/hooks/useLoadMoreList";
import { formatDate } from "../../../shared/utils/dates";
import { GET_RENTALS } from "../api/queries";

interface Rental {
	id: number;
	status: string | null;
	startDate: string | null;
	company?: { name: string | null } | null;
	vehicle?: { plate: string | null } | null;
}

/** Lista de alquileres de solo lectura (las facturas no tienen lógica de facturación aún). */
export default function RentalsPage() {
	const intl = useIntl();
	const { items, loading, error, hasMore, loadMore } = useLoadMoreList<Rental>({ query: GET_RENTALS, field: "vehicleRentals", idKey: "id" });
	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
			<h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
				{intl.formatMessage({ id: "rentals.title", defaultMessage: "Alquileres" })}
			</h1>
			{error && (
				<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-400">
					{intl.formatMessage({ id: "common.loadError", defaultMessage: "No se pudo cargar la información" })}
				</p>
			)}
			<ul className="grid gap-3 md:grid-cols-2">
				{items.map((r) => (
					<li key={r.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
						<p className="font-semibold text-gray-800 dark:text-white/90">{r.vehicle?.plate ?? "—"}</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{[r.company?.name, formatDate(r.startDate), r.status].filter(Boolean).join(" · ")}
						</p>
					</li>
				))}
			</ul>
			{loading && <Loading size="sm" />}
			{!loading && !error && items.length === 0 && (
				<EmptyState text={intl.formatMessage({ id: "rentals.empty", defaultMessage: "No hay alquileres" })} />
			)}
			{hasMore && (
				<button type="button" onClick={loadMore} className="min-h-11 cursor-pointer rounded-xl text-sm font-medium text-brand-500">
					{intl.formatMessage({ id: "common.loadMore", defaultMessage: "Ver más" })}
				</button>
			)}
		</div>
	);
}
