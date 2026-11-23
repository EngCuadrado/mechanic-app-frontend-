import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { ArrowRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import ActionBar from "../../../shared/components/ActionBar";
import IconButton from "../../../shared/components/IconButton";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { CAMBIAR_ESTADO_ORDEN } from "../api/mutations";
import { NEXT_STATUS, statusMessageId, type WorkOrderStatus } from "../constants";

const REFETCH = { refetchQueries: ["GetWorkOrder", "GetWorkOrders", "GetWorkOrderStatusCounts"] };

/** Barra fija abajo (a la derecha en tablet): agregar trabajo y el siguiente estado. Cancelar vive en el encabezado. */
export default function StatusActions({ workOrderId, status, onAdd }: { workOrderId: number; status: string; onAdd?: () => void }) {
	const intl = useIntl();
	const navigate = useNavigate();
	const [change, changing] = useApiMutation(CAMBIAR_ESTADO_ORDEN, REFETCH);

	const next = NEXT_STATUS[status as WorkOrderStatus] ?? null;
	if (!next && !onAdd) return null;

	return (
		<ActionBar>
			<div className="flex flex-1 gap-2 lg:justify-end">
				{onAdd && (
					<IconButton
						variant="outline"
						showLabel
						className="flex-1 lg:max-w-56"
						icon={<PlusIcon className="size-5" />}
						label={intl.formatMessage({ id: "workOrder.add", defaultMessage: "Agregar" })}
						onClick={onAdd}
					/>
				)}
				{next && (
					<IconButton
						variant="primary"
						showLabel
						className="flex-1 lg:max-w-72"
						icon={<ArrowRightIcon className="size-5" />}
						label={intl.formatMessage({ id: statusMessageId(next), defaultMessage: next })}
						onClick={() => (next === "Entregado" ? navigate(`/ordenes/${workOrderId}/entregar`) : change({ workOrderId, newStatus: next }))}
						disabled={changing}
					/>
				)}
			</div>
		</ActionBar>
	);
}
