import { useState } from "react";
import { useIntl } from "react-intl";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import StepFlow from "../../../shared/components/StepFlow";
import { allRequiredDone, ChecklistBoard, useChecklist } from "../../inspections";
import { angleMessageId, GuidedPhotos, useAnglePhotos } from "../../photos";
import SignatureStep from "./SignatureStep";

interface Props {
	workOrderId: number;
	type: "Entrada" | "Salida";
	existingId: number | null;
	photoStage: "Antes" | "Despues";
	/** Entra directo a la firma (la revisión ya se guardó en la pantalla anterior). */
	startAtSignature?: boolean;
	signTitle: string;
	finishLabel: string;
	/** Quien firma: se pide su nombre junto a la firma. */
	nameLabel: string;
	initialName: string;
	onExit: () => void;
	onSign: (file: File) => Promise<boolean>;
	signing: boolean;
	onFinished: (name: string) => Promise<void>;
}

/** Con la orden ya creada: fotos guiadas y revisión básica en una pantalla, y la firma con el nombre de quien firma. */
export default function ChecklistFlow({ workOrderId, type, existingId, photoStage, startAtSignature = false, signTitle, finishLabel, nameLabel, initialName, onExit, onSign, signing, onFinished }: Props) {
	const intl = useIntl();
	const checklist = useChecklist({ workOrderId, type, existingId });
	const photos = useAnglePhotos({
		workOrderId,
		stage: photoStage,
		compareStage: type === "Salida" ? "Antes" : undefined,
		vehicleInspectionId: checklist.inspectionId,
	});
	const [onSignature, setOnSignature] = useState(startAtSignature);
	const [signed, setSigned] = useState(false);
	const [name, setName] = useState(initialName);
	const [busy, setBusy] = useState(false);
	const t = (id: string, defaultMessage: string, values?: Record<string, string>) => intl.formatMessage({ id, defaultMessage }, values);

	if (checklist.loading) return <Loading />;
	if (checklist.error) return <EmptyState text={t("common.loadError", "No se pudo cargar la información")} />;

	const run = async (action: () => Promise<unknown>) => {
		if (busy) return;
		setBusy(true);
		try {
			await action();
		} finally {
			setBusy(false);
		}
	};

	if (onSignature)
		return (
			<StepFlow
				title={signTitle}
				step={2}
				total={2}
				onBack={() => setOnSignature(false)}
				nextLabel={finishLabel}
				nextDisabled={!signed || !name.trim()}
				loading={busy}
				onNext={() => run(() => onFinished(name.trim()))}
			>
				<SignatureStep
					name={name}
					onName={setName}
					nameLabel={nameLabel}
					signed={signed}
					saving={signing}
					onSign={async (file) => {
						const ok = await onSign(file);
						setSigned(ok);
						return ok;
					}}
					onRedo={() => setSigned(false)}
				/>
			</StepFlow>
		);

	// El botón dice lo primero que falta; vacío = se puede avanzar.
	const missing =
		photos.missing.length > 0
			? t("inspection.missing.photos", "Faltan fotos: {list}", { list: photos.missing.map((a) => t(angleMessageId(a), a)).join(", ") })
			: !allRequiredDone(checklist.groups, checklist.values)
				? t("inspection.missing.checklist", "Completa la revisión")
				: "";

	return (
		<StepFlow
			wide
			title={type === "Entrada" ? t("workOrder.review.entry", "Revisión de entrada") : t("workOrder.review.exit", "Revisión de salida")}
			step={1}
			total={2}
			onBack={onExit}
			nextLabel={missing || t("common.next", "Siguiente")}
			nextDisabled={missing !== ""}
			loading={busy || checklist.saving}
			onNext={() => run(async () => (await checklist.finish()) && setOnSignature(true))}
		>
			<div className="grid gap-4 lg:grid-cols-2 lg:items-start">
				<GuidedPhotos photos={photos} compareLabel={type === "Salida" ? t("inspection.type.Entrada", "Entrada") : undefined} />
				<ChecklistBoard groups={checklist.groups} values={checklist.values} notes={checklist.notes} setValue={checklist.setValue} setNote={checklist.setNote} />
			</div>
		</StepFlow>
	);
}
