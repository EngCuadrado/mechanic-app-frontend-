import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { useDraggable } from "@dnd-kit/core";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import IconButton from "../../../shared/components/IconButton";
import { NEXT_STATUS, statusMessageId, type WorkOrderStatus } from "../constants";
import { orderPath } from "../readiness";
import type { WorkOrderSummary } from "../types";
import WorkOrderCard from "./WorkOrderCard";

interface Props {
	order: WorkOrderSummary;
	busy: boolean;
	onAdvance: (order: WorkOrderSummary) => void;
}

/**
 * Tarjeta del tablero: se abre al tocarla, se agarra completa para arrastrarla (se inclina al levantarla) y avanza con su botón.
 * No es un enlace <a>: dnd-kit bloquea el clic posterior a un arrastre y sobre un <a> el navegador lo seguiría con recarga completa.
 */
export default function BoardCard({ order, busy, onAdvance }: Props) {
	const intl = useIntl();
	const navigate = useNavigate();
	const next = NEXT_STATUS[order.currentStatus as WorkOrderStatus];
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: order.workOrderId,
		data: { order },
		// Las entregadas ya no se mueven.
		disabled: !next,
	});
	const nextLabel = next ? intl.formatMessage({ id: statusMessageId(next), defaultMessage: next }) : "";
	const move = transform ? `translate(${transform.x}px, ${transform.y}px)` : "";

	return (
		<div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			style={{ transform: isDragging ? `${move} rotate(3deg) scale(1.03)` : move || undefined, touchAction: "manipulation" }}
			className={`relative flex flex-col gap-2 transition-shadow ${isDragging ? "z-50 cursor-grabbing opacity-95 shadow-2xl" : next ? "cursor-grab" : ""}`}
		>
			<WorkOrderCard order={order} onOpen={() => navigate(orderPath(order))} />
			{next && (
				<IconButton
					variant="outline"
					showLabel
					className="w-full"
					disabled={busy}
					icon={<ArrowRightIcon className="size-5" />}
					label={intl.formatMessage({ id: "workOrder.moveTo", defaultMessage: "Pasar a {status}" }, { status: nextLabel })}
					onClick={() => onAdvance(order)}
				/>
			)}
		</div>
	);
}
