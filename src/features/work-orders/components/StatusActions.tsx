import { useState } from "react";
import { useIntl } from "react-intl";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ActionBar from "../../../shared/components/ActionBar";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import IconButton from "../../../shared/components/IconButton";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { CAMBIAR_ESTADO_ORDEN, CANCELAR_ORDEN } from "../api/mutations";
import { CANCELLABLE, NEXT_STATUS, statusMessageId, type WorkOrderStatus } from "../constants";

const REFETCH = { refetchQueries: ["GetWorkOrder", "GetWorkOrders"] };

/** Barra fija abajo: una acción principal (siguiente estado) y cancelar con confirmación. */
export default function StatusActions({ workOrderId, status }: { workOrderId: number; status: string }) {
	const intl = useIntl();
	const [confirm, setConfirm] = useState<"next" | "cancel" | null>(null);
	const [change, changing] = useApiMutation(CAMBIAR_ESTADO_ORDEN, REFETCH);
	const [cancel, cancelling] = useApiMutation(CANCELAR_ORDEN, REFETCH);

	const next = NEXT_STATUS[status as WorkOrderStatus] ?? null;
	const canCancel = CANCELLABLE.includes(status);
	if (!next && !canCancel) return null;

	const nextLabel = next ? intl.formatMessage({ id: statusMessageId(next), defaultMessage: next }) : "";
	const run = async () => {
		const ok = confirm === "cancel" ? await cancel({ workOrderId }) : await change({ workOrderId, newStatus: next });
		if (ok) setConfirm(null);
	};

	return (
		<>
			<ActionBar>
				{canCancel && (
					<IconButton
						variant="outline"
						showLabel
						icon={<XMarkIcon className="size-5" />}
						label={intl.formatMessage({ id: "workOrder.cancel", defaultMessage: "Cancelar orden" })}
						onClick={() => setConfirm("cancel")}
					/>
				)}
				{next && (
					<IconButton
						variant="primary"
						showLabel
						icon={<ArrowRightIcon className="size-5" />}
						label={nextLabel}
						onClick={() => (next === "Entregado" ? setConfirm("next") : change({ workOrderId, newStatus: next }))}
						disabled={changing}
					/>
				)}
			</ActionBar>
			<ConfirmDialog
				isOpen={confirm !== null}
				danger={confirm === "cancel"}
				loading={changing || cancelling}
				title={
					confirm === "cancel"
						? intl.formatMessage({ id: "workOrder.cancel", defaultMessage: "Cancelar orden" })
						: nextLabel
				}
				message={
					confirm === "cancel"
						? intl.formatMessage({ id: "workOrder.cancel.confirm", defaultMessage: "Se devolverá el stock de los repuestos y la orden quedará cerrada." })
						: intl.formatMessage({ id: "workOrder.deliver.confirm", defaultMessage: "Al entregar, la orden queda cerrada y no se podrá editar." })
				}
				confirmLabel={intl.formatMessage({ id: "common.confirm", defaultMessage: "Confirmar" })}
				onConfirm={run}
				onClose={() => setConfirm(null)}
			/>
		</>
	);
}
