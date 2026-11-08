import { useState } from "react";
import { useIntl } from "react-intl";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import StepFlow from "../../../shared/components/StepFlow";
import { ChecklistStep, missingRequired, useChecklist } from "../../inspections";
import SignatureStep from "./SignatureStep";

interface Props {
	workOrderId: number;
	type: "Entrada" | "Salida";
	existingId: number | null;
	photoStage: "Antes" | "Despues";
	/** Pasos que la página ya mostró antes (para numerar el progreso). */
	stepOffset: number;
	signTitle: string;
	finishLabel: string;
	/** Nombre de quien firma, si hay que pedirlo (quien recoge). */
	askName?: { label: string; initial: string };
	onExit: () => void;
	onSign: (file: File) => Promise<boolean>;
	signing: boolean;
	onFinished: (name: string) => Promise<void>;
}

/** Inspección (una categoría por paso, desde el backend) y al final la firma. Sirve para entrada y salida. */
export default function ChecklistFlow({ workOrderId, type, existingId, photoStage, stepOffset, signTitle, finishLabel, askName, onExit, onSign, signing, onFinished }: Props) {
	const intl = useIntl();
	const checklist = useChecklist({ workOrderId, type, existingId });
	const [s, setS] = useState(0);
	const [signed, setSigned] = useState(false);
	const [name, setName] = useState(askName?.initial ?? "");
	const [busy, setBusy] = useState(false);

	if (checklist.loading) return <Loading />;
	if (checklist.error) return <EmptyState text={intl.formatMessage({ id: "common.loadError", defaultMessage: "No se pudo cargar la información" })} />;

	const { groups } = checklist;
	const onSignature = s >= groups.length;
	const group = groups[s];
	const next = async () => {
		if (busy) return;
		setBusy(true);
		try {
			if (onSignature) return await onFinished(name.trim());
			const ok = s === groups.length - 1 ? await checklist.finish() : await checklist.saveGroup(s);
			if (ok) setS(s + 1);
		} finally {
			setBusy(false);
		}
	};

	return (
		<StepFlow
			title={onSignature ? signTitle : (group.category?.name ?? "")}
			step={stepOffset + s + 1}
			total={stepOffset + groups.length + 1}
			onBack={s === 0 ? onExit : () => setS(s - 1)}
			nextLabel={onSignature ? finishLabel : intl.formatMessage({ id: s === groups.length - 1 ? "common.finish" : "common.next", defaultMessage: "Siguiente" })}
			nextDisabled={onSignature ? !signed || (askName !== undefined && !name.trim()) : missingRequired(group, checklist.values).length > 0}
			loading={busy || checklist.saving}
			onNext={next}
		>
			{groups.length === 0 && s === 0 && (
				<p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600 dark:bg-white/[0.03] dark:text-gray-300">
					{intl.formatMessage({ id: "inspection.wizard.empty", defaultMessage: "No hay checklist configurado. Puedes continuar." })}
				</p>
			)}
			{onSignature ? (
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
			) : (
				<ChecklistStep group={group} checklist={checklist} workOrderId={workOrderId} photoStage={photoStage} />
			)}
		</StepFlow>
	);
}
