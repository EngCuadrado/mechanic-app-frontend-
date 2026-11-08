import { useIntl } from "react-intl";
import { statusMessageId } from "../constants";

const COLORS: Record<string, string> = {
	Recibido: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
	"En proceso": "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
	Listo: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
	Entregado: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
	Cancelado: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

/** El texto siempre acompaña al color (no solo color para indicar estado). */
export default function StatusBadge({ status }: { status: string }) {
	const intl = useIntl();
	return (
		<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${COLORS[status] ?? COLORS.Entregado}`}>
			{intl.formatMessage({ id: statusMessageId(status), defaultMessage: status })}
		</span>
	);
}
