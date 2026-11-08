import { useIntl } from "react-intl";
import { CheckIcon } from "@heroicons/react/24/solid";
import { statusMessageId } from "../constants";

const FLOW = ["Recibido", "En proceso", "Listo", "Entregado"];

/** Línea de progreso Recibido → Entregado. Una orden cancelada no muestra avance. */
export default function StatusProgress({ status }: { status: string }) {
	const intl = useIntl();
	if (status === "Cancelado") return null;
	const current = FLOW.indexOf(status);
	return (
		<ol className="flex" aria-label={intl.formatMessage({ id: "workOrder.progress", defaultMessage: "Progreso de la orden" })}>
			{FLOW.map((s, i) => {
				const done = i < current || status === "Entregado";
				const now = i === current && status !== "Entregado";
				return (
					<li key={s} aria-current={now ? "step" : undefined} className="relative flex flex-1 flex-col items-center gap-1.5 text-center">
						{i > 0 && <span aria-hidden className={`absolute top-3 right-1/2 h-0.5 w-full ${i <= current || status === "Entregado" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
						<span
							className={`relative flex size-6 items-center justify-center rounded-full border-2 ${
								done
									? "border-emerald-500 bg-emerald-500 text-white"
									: now
										? "border-amber-500 bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-500/20"
										: "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
							}`}
						>
							{done && <CheckIcon className="size-3.5" />}
						</span>
						<span className={`text-xs font-medium ${now ? "text-gray-800 dark:text-white/90" : "text-gray-500 dark:text-gray-400"}`}>
							{intl.formatMessage({ id: statusMessageId(s), defaultMessage: s })}
						</span>
					</li>
				);
			})}
		</ol>
	);
}
