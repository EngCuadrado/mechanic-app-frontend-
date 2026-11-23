import { useNavigate } from "react-router";
import { useDraggable } from "@dnd-kit/core";
import { NEXT_STATUS, type WorkOrderStatus } from "../constants";
import { orderPath } from "../readiness";
import type { WorkOrderSummary } from "../types";
import WorkOrderCard from "./WorkOrderCard";

/**
 * Tarjeta del tablero: se abre al tocarla y se arrastra completa (toque largo en pantalla táctil) a la columna siguiente.
 * No es un enlace <a>: dnd-kit bloquea el clic posterior a un arrastre y sobre un <a> el navegador lo seguiría con recarga completa.
 */
export default function BoardCard({ order, busy }: { order: WorkOrderSummary; busy: boolean }) {
	const navigate = useNavigate();
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: order.workOrderId,
		data: { order },
		disabled: busy || !NEXT_STATUS[order.currentStatus as WorkOrderStatus],
	});
	const move = transform ? `translate(${transform.x}px, ${transform.y}px)` : "";

	return (
		<div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			style={{ transform: isDragging ? `${move} rotate(3deg) scale(1.03)` : move || undefined, touchAction: "manipulation" }}
			className={`relative transition-shadow ${isDragging ? "z-50 cursor-grabbing opacity-95 shadow-2xl" : "cursor-grab"}`}
		>
			<WorkOrderCard order={order} onOpen={() => navigate(orderPath(order))} />
		</div>
	);
}
