import { useState } from "react";
import { useIntl } from "react-intl";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import IconButton from "../../../shared/components/IconButton";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { CANCELAR_ORDEN } from "../api/mutations";
import { CANCELLABLE } from "../constants";

const REFETCH = { refetchQueries: ["GetWorkOrder", "GetWorkOrders", "GetWorkOrderStatusCounts"] };

/** Cancelar en el encabezado: acción destructiva, discreta (icono + texto corto) y con confirmación. */
export default function CancelOrderButton({ workOrderId, status }: { workOrderId: number; status: string }) {
	const intl = useIntl();
	const [confirm, setConfirm] = useState(false);
	const [cancel, cancelling] = useApiMutation(CANCELAR_ORDEN, REFETCH);
	if (!CANCELLABLE.includes(status)) return null;
	const label = intl.formatMessage({ id: "workOrder.cancelShort", defaultMessage: "Cancelar" });
	const title = intl.formatMessage({ id: "workOrder.cancel", defaultMessage: "Cancelar orden" });

	return (
		<>
			<IconButton variant="ghost" showLabel className="text-red-600 dark:text-red-400" icon={<XMarkIcon className="size-5" />} label={label} title={title} onClick={() => setConfirm(true)} />
			<ConfirmDialog
				isOpen={confirm}
				danger
				loading={cancelling}
				title={title}
				message={intl.formatMessage({ id: "workOrder.cancel.confirm", defaultMessage: "Se devolverá el stock de los repuestos y la orden quedará cerrada." })}
				confirmLabel={title}
				onConfirm={async () => {
					if (await cancel({ workOrderId })) setConfirm(false);
				}}
				onClose={() => setConfirm(false)}
			/>
		</>
	);
}
