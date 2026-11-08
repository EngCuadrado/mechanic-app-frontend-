import { useIntl } from "react-intl";
import { statusMessageId } from "../constants";

/** Colores por estado, una sola vez: insignia, franja de la tarjeta y tarjeta de filtro. */
export const STATUS_STYLES: Record<string, { badge: string; stripe: string; tile: string; ring: string }> = {
	Recibido: {
		badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
		stripe: "bg-blue-500",
		tile: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
		ring: "border-blue-500",
	},
	"En proceso": {
		badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
		stripe: "bg-amber-500",
		tile: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
		ring: "border-amber-500",
	},
	Listo: {
		badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
		stripe: "bg-emerald-500",
		tile: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
		ring: "border-emerald-500",
	},
	Entregado: {
		badge: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
		stripe: "bg-gray-400",
		tile: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
		ring: "border-gray-500",
	},
	Cancelado: {
		badge: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
		stripe: "bg-red-500",
		tile: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
		ring: "border-red-500",
	},
};

export const statusStyle = (status: string) => STATUS_STYLES[status] ?? STATUS_STYLES.Entregado;

/** El texto siempre acompaña al color (no solo color para indicar estado). */
export default function StatusBadge({ status }: { status: string }) {
	const intl = useIntl();
	return (
		<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(status).badge}`}>
			{intl.formatMessage({ id: statusMessageId(status), defaultMessage: status })}
		</span>
	);
}
