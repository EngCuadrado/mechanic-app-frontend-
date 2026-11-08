import { useNavigate, useParams } from "react-router";
import { useIntl } from "react-intl";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { ACTUALIZAR_ORDEN, CAMBIAR_ESTADO_ORDEN } from "../api/mutations";
import ChecklistFlow from "../components/ChecklistFlow";
import { useSignOrder } from "../hooks/useSignOrder";
import { useWorkOrder } from "../hooks/useWorkOrder";

const REFETCH = { refetchQueries: ["GetWorkOrders", "GetWorkOrder", "GetWorkOrderStatusCounts"] };

/** Entregar un vehículo (orden Listo): inspección de salida, nombre y firma de quien lo recoge, y pasa a Entregado. */
export default function DeliveryPage() {
	const intl = useIntl();
	const navigate = useNavigate();
	const id = Number(useParams().id);
	const { order, loading } = useWorkOrder(id);
	const { sign, signing } = useSignOrder("pickup");
	const [update] = useApiMutation(ACTUALIZAR_ORDEN);
	const [change] = useApiMutation(CAMBIAR_ESTADO_ORDEN, REFETCH);

	if (loading && !order) return <Loading />;
	if (!order || order.currentStatus !== "Listo")
		return <EmptyState text={intl.formatMessage({ id: "workOrder.delivery.notReady", defaultMessage: "La orden debe estar en Listo para entregarla." })} />;

	return (
		<ChecklistFlow
			workOrderId={id}
			type="Salida"
			existingId={order.inspections.find((i) => i.inspectionType === "Salida")?.vehicleInspectionId ?? null}
			photoStage="Despues"
			stepOffset={0}
			signTitle={intl.formatMessage({ id: "workOrder.delivery.sign", defaultMessage: "Firma de quien recoge" })}
			finishLabel={intl.formatMessage({ id: "workOrder.delivery.deliver", defaultMessage: "Entregar vehículo" })}
			askName={{ label: intl.formatMessage({ id: "workOrder.delivery.pickup", defaultMessage: "Quien lo recoge" }), initial: order.pickupDriverName ?? "" }}
			onExit={() => navigate("/ordenes")}
			onSign={(file) => sign(id, file)}
			signing={signing}
			onFinished={async (name) => {
				if (!(await update({ workOrderId: id, pickupDriverName: name }))) return;
				if (await change({ workOrderId: id, newStatus: "Entregado" })) navigate("/ordenes");
			}}
		/>
	);
}
