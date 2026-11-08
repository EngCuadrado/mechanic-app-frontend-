import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useIntl } from "react-intl";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import StepFlow from "../../../shared/components/StepFlow";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { CREAR_ORDEN } from "../api/mutations";
import ChecklistFlow from "../components/ChecklistFlow";
import VehicleStep, { type PickedVehicle } from "../components/VehicleStep";
import { orderTypeForReason, reasonMessageId } from "../constants";
import { useSignOrder } from "../hooks/useSignOrder";
import { useWorkOrder } from "../hooks/useWorkOrder";

/**
 * Recibir un vehículo: 1) vehículo y motivo, 2) inspección de entrada, 3) firma.
 * Con /ordenes/:id/recibir se retoma una recepción que quedó a medias.
 */
export default function ReceptionPage() {
	const intl = useIntl();
	const navigate = useNavigate();
	const idParam = useParams().id;
	const resumeId = idParam ? Number(idParam) : null;
	const { order, loading } = useWorkOrder(resumeId ?? NaN);
	const [workOrderId, setWorkOrderId] = useState<number | null>(null);
	const [vehicle, setVehicle] = useState<PickedVehicle | null>(null);
	const [reason, setReason] = useState<string | null>(null);
	const [driver, setDriver] = useState("");
	const [create, creating] = useApiMutation<{ crearOrden: { workOrderId: number } }>(CREAR_ORDEN, {
		refetchQueries: ["GetWorkOrders", "GetWorkOrderStatusCounts"],
	});
	const { sign, signing } = useSignOrder("dropoff");
	const exit = () => navigate("/ordenes");

	if (resumeId !== null && loading && !order) return <Loading />;
	if (resumeId !== null && (!order || order.currentStatus !== "Recibido"))
		return <EmptyState text={intl.formatMessage({ id: "workOrder.notFound", defaultMessage: "Orden no encontrada" })} />;

	const id = resumeId ?? workOrderId;
	if (id !== null) {
		return (
			<ChecklistFlow
				workOrderId={id}
				type="Entrada"
				existingId={order?.inspections.find((i) => i.inspectionType === "Entrada")?.vehicleInspectionId ?? null}
				photoStage="Antes"
				stepOffset={resumeId === null ? 1 : 0}
				signTitle={intl.formatMessage({ id: "workOrder.reception.sign", defaultMessage: "Firma del cliente" })}
				finishLabel={intl.formatMessage({ id: "workOrder.reception.receive", defaultMessage: "Recibir vehículo" })}
				onExit={exit}
				onSign={(file) => sign(id, file)}
				signing={signing}
				onFinished={async () => exit()}
			/>
		);
	}

	const ready = vehicle !== null && reason !== null && driver.trim() !== "";
	const start = async () => {
		if (!vehicle || !reason) return;
		const data = await create({
			vehicleId: vehicle.vehicleId,
			type: orderTypeForReason(reason),
			reportedIssue: intl.formatMessage({ id: reasonMessageId(reason) }),
			dropoffDriverName: driver.trim(),
		});
		if (data) setWorkOrderId(data.crearOrden.workOrderId);
	};

	return (
		<StepFlow
			title={intl.formatMessage({ id: "workOrder.reception.title", defaultMessage: "Recibir vehículo" })}
			step={1}
			total={3}
			onBack={exit}
			nextLabel={intl.formatMessage({ id: "common.next", defaultMessage: "Siguiente" })}
			nextDisabled={!ready}
			loading={creating}
			onNext={start}
		>
			<VehicleStep vehicle={vehicle} onVehicle={setVehicle} reason={reason} onReason={setReason} driver={driver} onDriver={setDriver} />
		</StepFlow>
	);
}
