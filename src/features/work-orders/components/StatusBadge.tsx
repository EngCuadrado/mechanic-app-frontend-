import type { ReactNode } from "react";
import { useIntl } from "react-intl";
import { statusMessageId } from "../constants";

/** Estados al estilo Jira: etiqueta (lozenge) con color suave y texto en mayúsculas; encabezados neutros. */
export const STATUS_STYLES: Record<string, { badge: string; label: string; stripe: string; tile: string; ring: string }> = {
	Recibido: {
		badge: "bg-[#DFE1E6] text-[#42526E] dark:bg-white/10 dark:text-gray-300",
		label: "bg-[#5E6C84] text-white",
		stripe: "bg-gray-400",
		tile: "bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300",
		ring: "border-gray-500",
	},
	"En proceso": {
		badge: "bg-[#DEEBFF] text-[#0747A6] dark:bg-blue-500/20 dark:text-blue-300",
		label: "bg-[#0C66E4] text-white",
		stripe: "bg-blue-500",
		tile: "bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300",
		ring: "border-blue-500",
	},
	Listo: {
		badge: "bg-[#EAE6FF] text-[#403294] dark:bg-violet-500/20 dark:text-violet-300",
		label: "bg-[#6E5DC6] text-white",
		stripe: "bg-violet-500",
		tile: "bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300",
		ring: "border-violet-500",
	},
	Entregado: {
		badge: "bg-[#E3FCEF] text-[#006644] dark:bg-emerald-500/20 dark:text-emerald-300",
		label: "bg-[#1F845A] text-white",
		stripe: "bg-emerald-500",
		tile: "bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300",
		ring: "border-emerald-500",
	},
	Cancelado: {
		badge: "bg-[#FFEBE6] text-[#BF2600] dark:bg-red-500/20 dark:text-red-300",
		label: "bg-[#C9372C] text-white",
		stripe: "bg-red-500",
		tile: "bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300",
		ring: "border-red-500",
	},
};

export const statusStyle = (status: string) => STATUS_STYLES[status] ?? STATUS_STYLES.Entregado;

/** El texto siempre acompaña al color (no solo color para indicar estado). */
export default function StatusBadge({ status }: { status: string }) {
	const intl = useIntl();
	return (
		<span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${statusStyle(status).badge}`}>
			{intl.formatMessage({ id: statusMessageId(status), defaultMessage: status })}
		</span>
	);
}

/** Etiqueta sólida estilo Trello (tarjetas y encabezados del tablero). `children` reemplaza el nombre del estado. */
export function StatusLabel({ status, children }: { status: string; children?: ReactNode }) {
	const intl = useIntl();
	return (
		<span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${statusStyle(status).label}`}>
			{children ?? intl.formatMessage({ id: statusMessageId(status), defaultMessage: status })}
		</span>
	);
}
