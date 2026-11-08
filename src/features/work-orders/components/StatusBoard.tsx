import { useState } from "react";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { toast } from "sonner";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import Loading from "../../../components/ui/loading/Loading";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import EmptyState from "../../../shared/components/EmptyState";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { CAMBIAR_ESTADO_ORDEN, CANCELAR_ORDEN } from "../api/mutations";
import { NEXT_STATUS, statusMessageId, type WorkOrderStatus } from "../constants";
import { useBoardOrders } from "../hooks/useBoardOrders";
import type { WorkOrderSummary } from "../types";
import BoardCard from "./BoardCard";
import BoardColumn from "./BoardColumn";
import CancelDropZone, { CANCEL_ZONE_ID } from "./CancelDropZone";

const COLUMNS = ["Recibido", "En proceso", "Listo", "Entregado"];
const REFETCH = { refetchQueries: ["GetWorkOrders", "GetWorkOrder", "GetWorkOrderStatusCounts"] };

/** Tablero: una columna por estado abierto. Cambiar de estado = botón de la tarjeta o arrastrarla a la columna siguiente. */
export default function StatusBoard() {
	const intl = useIntl();
	const navigate = useNavigate();
	const { orders, loading, error } = useBoardOrders();
	const [change, changing] = useApiMutation(CAMBIAR_ESTADO_ORDEN, REFETCH);
	const [cancel, cancelling] = useApiMutation(CANCELAR_ORDEN, REFETCH);
	const [toCancel, setToCancel] = useState<WorkOrderSummary | null>(null);
	const [dragging, setDragging] = useState<WorkOrderSummary | null>(null);
	// Largo toque en pantalla táctil para no confundirlo con el scroll; distancia mínima con mouse.
	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
	);

	const advance = (o: WorkOrderSummary) => {
		const next = NEXT_STATUS[o.currentStatus as WorkOrderStatus];
		if (!next) return;
		if (next === "Entregado") navigate(`/ordenes/${o.workOrderId}/entregar`);
		else change({ workOrderId: o.workOrderId, newStatus: next });
	};

	const onDragEnd = (e: DragEndEvent) => {
		const order = dragging;
		setDragging(null);
		const target = e.over?.id as string | undefined;
		if (order && target === CANCEL_ZONE_ID) return setToCancel(order);
		if (!order || !target || target === order.currentStatus) return;
		// El backend solo permite avanzar un paso; la tarjeta vuelve sola a su columna y se explica por qué.
		const next = NEXT_STATUS[order.currentStatus as WorkOrderStatus];
		if (target === next) return advance(order);
		const flow = COLUMNS as readonly string[];
		const backwards = flow.indexOf(target) < flow.indexOf(order.currentStatus);
		toast.warning(
			backwards
				? intl.formatMessage({ id: "workOrder.noGoBack", defaultMessage: "Una orden no puede volver a un estado anterior." })
				: intl.formatMessage(
						{ id: "workOrder.skipStep", defaultMessage: "Primero debe pasar a {status}." },
						{ status: intl.formatMessage({ id: statusMessageId(next ?? ""), defaultMessage: next ?? "" }) },
					),
		);
	};

	if (error) return <EmptyState text={intl.formatMessage({ id: "common.loadError", defaultMessage: "No se pudo cargar la información" })} />;
	if (loading && orders.length === 0) return <Loading />;

	return (
		<>
			<DndContext sensors={sensors} onDragStart={(e: DragStartEvent) => setDragging(e.active.data.current?.order ?? null)} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
				<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
					{COLUMNS.map((status) => {
						const list = orders.filter((o) => o.currentStatus === status);
						const accepting = dragging !== null && NEXT_STATUS[dragging.currentStatus as WorkOrderStatus] === status;
						return (
							<BoardColumn key={status} status={status} count={list.length} accepting={accepting}>
								{list.map((o) => (
									<BoardCard key={o.workOrderId} order={o} busy={changing} onAdvance={advance} />
								))}
								{list.length === 0 && (
									<p className="py-6 text-center text-sm text-gray-400">{intl.formatMessage({ id: "workOrder.columnEmpty", defaultMessage: "Sin órdenes" })}</p>
								)}
							</BoardColumn>
						);
					})}
				</div>
				{dragging && <CancelDropZone />}
			</DndContext>
			<ConfirmDialog
				isOpen={toCancel !== null}
				danger
				loading={cancelling}
				title={intl.formatMessage({ id: "workOrder.cancel", defaultMessage: "Cancelar orden" })}
				message={intl.formatMessage({ id: "workOrder.cancel.confirm", defaultMessage: "Se devolverá el stock de los repuestos y la orden quedará cerrada." })}
				confirmLabel={intl.formatMessage({ id: "workOrder.cancel", defaultMessage: "Cancelar orden" })}
				onConfirm={async () => {
					if (toCancel && (await cancel({ workOrderId: toCancel.workOrderId }))) setToCancel(null);
				}}
				onClose={() => setToCancel(null)}
			/>
		</>
	);
}
