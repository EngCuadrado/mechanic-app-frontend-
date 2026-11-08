import { useState } from "react";
import { useIntl } from "react-intl";
import { CheckIcon } from "@heroicons/react/24/outline";
import IconButton from "../../../shared/components/IconButton";
import SignaturePad from "../../../shared/components/SignaturePad";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { ACTUALIZAR_ORDEN } from "../api/mutations";
import { UPLOAD_SIGNATURE } from "../api/handover";
import type { WorkOrderDetail } from "../types";

const REFETCH = { refetchQueries: ["GetWorkOrder"] };

/** Acta de Entrega/Devolución: quién deja, quién recoge y firma. La firma se sube como foto y su URL se guarda en la orden. */
export default function HandoverSection({ order, readOnly }: { order: WorkOrderDetail; readOnly: boolean }) {
	const intl = useIntl();
	const [dropoff, setDropoff] = useState(order.dropoffDriverName ?? "");
	const [pickup, setPickup] = useState(order.pickupDriverName ?? "");
	const [update, updating] = useApiMutation(ACTUALIZAR_ORDEN, REFETCH);
	const [upload, uploading] = useApiMutation<{ registrarFotoOrden: { photoUrl: string } }>(UPLOAD_SIGNATURE, {
		refetchQueries: ["GetWorkOrderPhotos"],
	});
	const [who, setWho] = useState<"dropoff" | "pickup">("dropoff");

	const sign = async (file: File) => {
		const data = await upload({ workOrderId: order.workOrderId, stage: "Otro", category: who === "dropoff" ? "Firma entrega" : "Firma recepción", photoFile: file });
		if (!data) return;
		await update({
			workOrderId: order.workOrderId,
			[who === "dropoff" ? "dropoffSignatureUrl" : "pickupSignatureUrl"]: data.registrarFotoOrden.photoUrl,
		});
	};

	const saveNames = () => update({ workOrderId: order.workOrderId, dropoffDriverName: dropoff.trim() || null, pickupDriverName: pickup.trim() || null });
	const signed = who === "dropoff" ? order.dropoffSignatureUrl : order.pickupSignatureUrl;

	return (
		<section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
			<h2 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
				{intl.formatMessage({ id: "handover.title", defaultMessage: "Acta de entrega" })}
			</h2>
			<div className="grid gap-3 sm:grid-cols-2">
				<div>
					<Label htmlFor="ho-drop">{intl.formatMessage({ id: "workOrder.dropoffDriver", defaultMessage: "Quien lo deja" })}</Label>
					<Input id="ho-drop" value={dropoff} disabled={readOnly} onChange={(e) => setDropoff(e.target.value)} />
				</div>
				<div>
					<Label htmlFor="ho-pick">{intl.formatMessage({ id: "handover.pickupDriver", defaultMessage: "Quien lo recoge" })}</Label>
					<Input id="ho-pick" value={pickup} disabled={readOnly} onChange={(e) => setPickup(e.target.value)} />
				</div>
			</div>
			{!readOnly && (
				<div className="mt-3">
					<IconButton
						variant="outline"
						showLabel
						disabled={updating}
						icon={<CheckIcon className="size-5" />}
						label={intl.formatMessage({ id: "common.save", defaultMessage: "Guardar" })}
						onClick={saveNames}
					/>
				</div>
			)}
			<div className="mt-4 flex gap-2" role="radiogroup">
				{(["dropoff", "pickup"] as const).map((w) => (
					<button
						key={w}
						type="button"
						role="radio"
						aria-checked={who === w}
						onClick={() => setWho(w)}
						className={`min-h-11 flex-1 cursor-pointer rounded-full border text-sm font-medium ${
							who === w ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
						}`}
					>
						{intl.formatMessage({ id: `handover.sign.${w}`, defaultMessage: w === "dropoff" ? "Firma de quien deja" : "Firma de quien recoge" })}
					</button>
				))}
			</div>
			{signed && <img src={signed} alt="" className="mt-3 h-32 rounded-xl border border-gray-200 bg-white object-contain dark:border-gray-800" />}
			{!readOnly && (
				<div className="mt-3">
					<SignaturePad onSave={sign} saving={uploading || updating} />
				</div>
			)}
		</section>
	);
}
