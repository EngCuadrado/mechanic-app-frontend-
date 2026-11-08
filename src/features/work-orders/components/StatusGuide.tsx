import { useIntl } from "react-intl";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { statusMessageId, NEXT_STATUS, type WorkOrderStatus } from "../constants";
import type { OrderTask, TaskTarget } from "../hooks/useOrderTasks";

interface Props {
	status: string;
	tasks: OrderTask[];
	onGo: (target: TaskTarget) => void;
}

/** Qué falta en el estado actual. Cada pendiente es un botón grande que lleva a donde se completa. */
export default function StatusGuide({ status, tasks, onGo }: Props) {
	const intl = useIntl();
	const next = NEXT_STATUS[status as WorkOrderStatus];
	if (!next || tasks.length === 0) return null;
	const pending = tasks.filter((t) => !t.done).length;
	const nextLabel = intl.formatMessage({ id: statusMessageId(next), defaultMessage: next });

	return (
		<section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
			<h2 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
				{pending
					? intl.formatMessage({ id: "workOrder.guide.pending", defaultMessage: "Falta antes de pasar a {status}" }, { status: nextLabel })
					: intl.formatMessage({ id: "workOrder.guide.ready", defaultMessage: "Todo listo para pasar a {status}" }, { status: nextLabel })}
			</h2>
			<ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{tasks.map((t) => (
					<li key={t.id}>
						<button
							type="button"
							onClick={() => onGo(t.target)}
							className={`flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl border px-3 text-left text-sm font-medium ${
								t.done
									? "border-success-300 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400"
									: "border-gray-300 text-gray-800 dark:border-gray-700 dark:text-gray-200"
							}`}
						>
							{t.done ? (
								<CheckCircleIcon className="size-6 shrink-0" aria-hidden />
							) : (
								<span className="size-6 shrink-0 rounded-full border-2 border-gray-300 dark:border-gray-600" aria-hidden />
							)}
							{intl.formatMessage({ id: `workOrder.guide.task.${t.labelId}` })}
							<span className="sr-only">
								{intl.formatMessage({ id: t.done ? "workOrder.guide.done" : "workOrder.guide.todo", defaultMessage: t.done ? "Hecho" : "Pendiente" })}
							</span>
						</button>
					</li>
				))}
			</ul>
		</section>
	);
}
