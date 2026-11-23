import { useLocation, useNavigate, useParams } from "react-router";
import { useIntl } from "react-intl";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { GUARDAR_QUIEN_ENTREGA } from "../api/mutations";
import ChecklistFlow from "../components/ChecklistFlow";
import NewReception from "../components/NewReception";
import { useSignOrder } from "../hooks/useSignOrder";
import { useWorkOrder } from "../hooks/useWorkOrder";

/**
 * Recibir un vehículo en 2 pasos: 1) placa, trabajo, fotos y revisión básica; 2) nombre y firma de quien lo trae.
 * /ordenes/:id/recibir retoma una recepción a medias (o entra directo a la firma si viene de crearla).
 */
export default function ReceptionPage() {
	const intl = useIntl();
	const navigate = useNavigate();
	const location = useLocation();
	const idParam = useParams().id;
	const resumeId = idParam ? Number(idParam) : null;
	const { order, loading } = useWorkOrder(resumeId ?? NaN);
	const { sign, signing } = useSignOrder("dropoff");
	const [saveName] = useApiMutation(GUARDAR_QUIEN_ENTREGA, { refetchQueries: ["GetWorkOrders", "GetWorkOrder"] });
	const exit = () => navigate("/ordenes");

	if (resumeId === null)
		return (
			<NewReception
				onExit={exit}
				onCreated={(id, complete) => navigate(`/ordenes/${id}/recibir`, { replace: true, state: { sign: complete } })}
			/>
		);

	if (loading && !order) return <Loading />;
	if (!order || order.currentStatus !== "Recibido")
		return <EmptyState text={intl.formatMessage({ id: "workOrder.notFound", defaultMessage: "Orden no encontrada" })} />;

	return (
		<ChecklistFlow
			workOrderId={resumeId}
			type="Entrada"
			existingId={order.inspections.find((i) => i.inspectionType === "Entrada")?.vehicleInspectionId ?? null}
			photoStage="Antes"
			startAtSignature={(location.state as { sign?: boolean } | null)?.sign === true}
			signTitle={intl.formatMessage({ id: "workOrder.reception.sign", defaultMessage: "Firma de quien lo trae" })}
			finishLabel={intl.formatMessage({ id: "workOrder.reception.receive", defaultMessage: "Recibir vehículo" })}
			nameLabel={intl.formatMessage({ id: "workOrder.reception.driver", defaultMessage: "Quien lo trae" })}
			initialName={order.dropoffDriverName ?? ""}
			onExit={exit}
			onSign={(file) => sign(resumeId, file)}
			signing={signing}
			onFinished={async (name) => {
				if (await saveName({ workOrderId: resumeId, name })) exit();
			}}
		/>
	);
}
