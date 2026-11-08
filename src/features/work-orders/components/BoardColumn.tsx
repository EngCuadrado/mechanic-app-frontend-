import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useIntl } from "react-intl";
import { statusMessageId } from "../constants";
import { statusStyle } from "./StatusBadge";

interface Props {
	status: string;
	count: number;
	/** Hay una tarjeta en el aire y esta columna es su único destino válido. */
	accepting: boolean;
	children: ReactNode;
}

export default function BoardColumn({ status, count, accepting, children }: Props) {
	const intl = useIntl();
	const { setNodeRef, isOver } = useDroppable({ id: status });
	const name = intl.formatMessage(
		status === "Entregado"
			? { id: "workOrder.deliveredToday", defaultMessage: "Entregadas hoy" }
			: { id: statusMessageId(status), defaultMessage: status },
	);
	return (
		<section
			ref={setNodeRef}
			aria-label={name}
			className={`flex min-h-48 flex-col gap-3 rounded-2xl border-2 p-3 transition-colors ${
				accepting && isOver
					? `${statusStyle(status).ring} bg-gray-50 dark:bg-white/[0.05]`
					: accepting
						? "border-dashed border-gray-300 dark:border-gray-600"
						: "border-transparent bg-gray-50 dark:bg-white/[0.02]"
			}`}
		>
			<h2 className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold ${statusStyle(status).tile}`}>
				{name}
				<span className="text-lg font-bold">{count}</span>
			</h2>
			{children}
		</section>
	);
}
