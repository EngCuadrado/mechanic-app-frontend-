import { useState } from "react";
import { useIntl } from "react-intl";
import StepFlow from "../../../shared/components/StepFlow";
import { allRequiredDone, ChecklistBoard, useChecklist } from "../../inspections";
import { angleMessageId, GuidedPhotos, useLocalAnglePhotos } from "../../photos";
import { useCreateReception } from "../hooks/useCreateReception";
import { useOpenOrder } from "../hooks/useOpenOrder";
import VehicleStep, { type PickedVehicle } from "./VehicleStep";

interface Props {
	onExit: () => void;
	/** La orden ya existe; `complete` = se guardó todo (si no, se retoma la revisión antes de firmar). */
	onCreated: (workOrderId: number, complete: boolean) => void;
}

/**
 * Recibir un carro en una pantalla: placa, qué se le va a hacer, fotos y revisión básica. Nada se guarda hasta "Siguiente":
 * ahí se crea la orden con todo y sigue la firma.
 */
export default function NewReception({ onExit, onCreated }: Props) {
	const intl = useIntl();
	const t = (id: string, defaultMessage: string, values?: Record<string, string>) => intl.formatMessage({ id, defaultMessage }, values);
	const [vehicle, setVehicle] = useState<PickedVehicle | null>(null);
	const [services, setServices] = useState<string[]>([]);
	const openOrderId = useOpenOrder(vehicle?.vehicleId ?? null);
	const checklist = useChecklist({ workOrderId: null, type: "Entrada" });
	const photos = useLocalAnglePhotos();
	const { submit, busy } = useCreateReception();

	// El botón dice lo primero que falta; vacío = se puede avanzar.
	const missing = !vehicle
		? t("workOrder.reception.missing.vehicle", "Elige el vehículo")
		: openOrderId != null
			? t("workOrder.openExists", "Este vehículo ya tiene una orden abierta")
			: services.length === 0
				? t("workOrder.reception.missing.work", "Elige qué se le va a hacer")
				: photos.missing.length > 0
					? t("inspection.missing.photos", "Faltan fotos: {list}", { list: photos.missing.map((a) => t(angleMessageId(a), a)).join(", ") })
					: !allRequiredDone(checklist.groups, checklist.values)
						? t("inspection.missing.checklist", "Completa la revisión")
						: "";

	const next = async () => {
		if (!vehicle || busy) return;
		const created = await submit({ vehicleId: vehicle.vehicleId, services, results: checklist.results(), shots: photos.shots });
		if (created) onCreated(created.id, created.complete);
	};

	return (
		<StepFlow
			wide
			title={t("workOrder.reception.title", "Recibir vehículo")}
			step={1}
			total={2}
			onBack={onExit}
			nextLabel={busy ? t("workOrder.reception.saving", "Guardando recepción…") : missing || t("common.next", "Siguiente")}
			nextDisabled={missing !== ""}
			loading={busy}
			onNext={next}
		>
			<div className="grid gap-4 lg:grid-cols-2 lg:items-start">
				<div className="flex flex-col gap-5">
					<VehicleStep vehicle={vehicle} onVehicle={setVehicle} services={services} onServices={setServices} openOrderId={openOrderId} />
					<ChecklistBoard groups={checklist.groups} values={checklist.values} notes={checklist.notes} setValue={checklist.setValue} setNote={checklist.setNote} />
				</div>
				<GuidedPhotos photos={photos} />
			</div>
		</StepFlow>
	);
}
