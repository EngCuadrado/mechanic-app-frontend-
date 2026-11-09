import { useState } from "react";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { ArrowRightIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ActionBar from "../../../shared/components/ActionBar";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import IconButton from "../../../shared/components/IconButton";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { CAMBIAR_ESTADO_ORDEN, CANCELAR_ORDEN } from "../api/mutations";
import { CANCELLABLE, NEXT_STATUS, statusMessageId, type WorkOrderStatus } from "../constants";

const REFETCH = { refetchQueries: ["GetWorkOrder", "GetWorkOrders", "GetWorkOrderStatusCounts"] };

/** Barra fija abajo: agregar trabajo, siguiente estado y cancelar con confirmación. */
export default function StatusActions({ workOrderId, status, onAdd }: { workOrderId: number; status: string; onAdd?: () => void }) {
	const intl = useIntl();
	const navigate = useNavigate();
	const [confirm, setConfirm] = useState(false);
	const [change, changing] = useApiMutation(CAMBIAR_ESTADO_ORDEN, REFETCH);
	const [cancel, cancelling] = useApiMutation(CANCELAR_ORDEN, REFETCH);

	const next = NEXT_STATUS[status as WorkOrderStatus] ?? null;
	const canCancel = CANCELLABLE.includes(status);
	if (!next && !canCancel) return null;

	const nextLabel = next ? intl.formatMessage({ id: statusMessageId(next), defaultMessage: next }) : "";
	const runCancel = async () => {
		if (await cancel({ workOrderId })) setConfirm(false);
	};

	return (
		<>
			{canCancel && (
				<IconButton
					variant="outline"
					showLabel
					className="w-full text-red-600 dark:text-red-400"
					icon={<XMarkIcon className="size-5" />}
					label={intl.formatMessage({ id: "workOrder.cancel", defaultMessage: "Cancelar orden" })}
					onClick={() => setConfirm(true)}
				/>
			)}
			<ActionBar>
				{onAdd && (
					<IconButton
						variant="outline"
						showLabel
						className="flex-1"
						icon={<PlusIcon className="size-5" />}
						label={intl.formatMessage({ id: "workOrder.add", defaultMessage: "Agregar" })}
						onClick={onAdd}
					/>
				)}
				{next && (
					<IconButton
						variant="primary"
						showLabel
						className="flex-1"
						icon={<ArrowRightIcon className="size-5" />}
						label={nextLabel}
						onClick={() =>
							next === "Entregado" ? navigate(`/ordenes/${workOrderId}/entregar`) : change({ workOrderId, newStatus: next })
						}
						disabled={changing}
					/>
				)}
			</ActionBar>
			<ConfirmDialog
				isOpen={confirm}
				danger
				loading={cancelling}
				title={intl.formatMessage({ id: "workOrder.cancel", defaultMessage: "Cancelar orden" })}
				message={intl.formatMessage({ id: "workOrder.cancel.confirm", defaultMessage: "Se devolverá el stock de los repuestos y la orden quedará cerrada." })}
				confirmLabel={intl.formatMessage({ id: "common.confirm", defaultMessage: "Confirmar" })}
				onConfirm={runCancel}
				onClose={() => setConfirm(false)}
			/>
		</>
	);
}
