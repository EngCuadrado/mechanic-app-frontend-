import { useState } from "react";
import { useIntl } from "react-intl";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import StepFlow from "../../../shared/components/StepFlow";
import { allRequiredDone, ChecklistBoard, isValidMileage, useChecklist } from "../../inspections";
import { angleMessageId, GuidedPhotos, useAnglePhotos } from "../../photos";
import MileageField from "./MileageField";
import SignatureStep from "./SignatureStep";

interface Props {
	workOrderId: number;
	type: "Entrada" | "Salida";
	existingId: number | null;
	photoStage: "Antes" | "Despues";
	/** Pasos que la página ya mostró antes (para numerar el progreso). */
	stepOffset: number;
	/** Último km conocido del carro: el nuevo no puede ser menor. */
	lastMileage: number | null;
	signTitle: string;
	finishLabel: string;
	/** Nombre de quien firma, si hay que pedirlo (quien recoge). */
	askName?: { label: string; initial: string };
	onExit: () => void;
	onSign: (file: File) => Promise<boolean>;
	signing: boolean;
	onFinished: (name: string) => Promise<void>;
}

/** Revisión exprés en una pantalla (km, fotos guiadas y checklist por excepción) y después la firma. Sirve para entrada y salida. */
export default function ChecklistFlow({ workOrderId, type, existingId, photoStage, stepOffset, lastMileage, signTitle, finishLabel, askName, onExit, onSign, signing, onFinished }: Props) {
	const intl = useIntl();
	const checklist = useChecklist({ workOrderId, type, existingId });
	const photos = useAnglePhotos({
		workOrderId,
		stage: photoStage,
		compareStage: type === "Salida" ? "Antes" : undefined,
		vehicleInspectionId: checklist.inspectionId,
	});
	const [onSignature, setOnSignature] = useState(false);
	const [km, setKm] = useState<string | null>(null); // null = aún no se tocó: se usa el ya guardado
	const [signed, setSigned] = useState(false);
	const [name, setName] = useState(askName?.initial ?? "");
	const [busy, setBusy] = useState(false);
	const t = (id: string, defaultMessage: string, values?: Record<string, string>) => intl.formatMessage({ id, defaultMessage }, values);

	if (checklist.loading) return <Loading />;
	if (checklist.error) return <EmptyState text={t("common.loadError", "No se pudo cargar la información")} />;

	const kmText = km ?? checklist.mileage?.toString() ?? "";
	const kmValue = kmText.trim() === "" ? null : Number(kmText);
	// El botón dice lo primero que falta; vacío = se puede avanzar.
	const missing = !isValidMileage(kmValue, lastMileage)
		? t("inspection.missing.mileage", "Falta el kilometraje")
		: photos.missing.length > 0
			? t("inspection.missing.photos", "Faltan fotos: {list}", { list: photos.missing.map((a) => t(angleMessageId(a), a)).join(", ") })
			: !allRequiredDone(checklist.groups, checklist.values)
				? t("inspection.missing.checklist", "Completa la revisión")
				: "";

	const next = async () => {
		if (busy) return;
		setBusy(true);
		try {
			if (onSignature) await onFinished(name.trim());
			else if (await checklist.finish(kmValue)) setOnSignature(true);
		} finally {
			setBusy(false);
		}
	};

	if (onSignature)
		return (
			<StepFlow
				title={signTitle}
				step={stepOffset + 2}
				total={stepOffset + 2}
				onBack={() => setOnSignature(false)}
				nextLabel={finishLabel}
				nextDisabled={!signed || (askName !== undefined && !name.trim())}
				loading={busy}
				onNext={next}
			>
				<SignatureStep
					name={askName ? name : undefined}
					onName={askName ? setName : undefined}
					nameLabel={askName?.label}
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

	return (
		<StepFlow
			wide
			title={type === "Entrada" ? t("workOrder.review.entry", "Revisión de entrada") : t("workOrder.review.exit", "Revisión de salida")}
			step={stepOffset + 1}
			total={stepOffset + 2}
			onBack={onExit}
			nextLabel={missing || t("common.next", "Siguiente")}
			nextDisabled={missing !== ""}
			loading={busy || checklist.saving}
			onNext={next}
		>
			<div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
				<div className="flex flex-col gap-4 lg:sticky lg:top-24">
					<MileageField value={kmText} onChange={setKm} last={lastMileage} />
					<GuidedPhotos photos={photos} compareLabel={type === "Salida" ? t("inspection.type.Entrada", "Entrada") : undefined} />
				</div>
				{checklist.groups.length === 0 ? (
					<p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600 dark:bg-white/[0.03] dark:text-gray-300">
						{t("inspection.wizard.empty", "No hay checklist configurado. Puedes continuar.")}
					</p>
				) : (
					<ChecklistBoard
						groups={checklist.groups}
						values={checklist.values}
						notes={checklist.notes}
						setValue={checklist.setValue}
						setNote={checklist.setNote}
					/>
				)}
			</div>
		</StepFlow>
	);
}
