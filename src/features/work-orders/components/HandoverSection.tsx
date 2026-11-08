import { useIntl } from "react-intl";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { ACTUALIZAR_ORDEN } from "../api/mutations";
import { UPLOAD_SIGNATURE } from "../api/handover";
import type { WorkOrderDetail } from "../types";
import SignatureCard from "./SignatureCard";

const REFETCH = { refetchQueries: ["GetWorkOrder"] };

type Who = "dropoff" | "pickup";

/** Quién deja y quién recoge el vehículo, cada uno con nombre y firma. La firma se sube como foto y su URL queda en la orden. */
export default function HandoverSection({ order, readOnly }: { order: WorkOrderDetail; readOnly: boolean }) {
	const intl = useIntl();
	const [update, updating] = useApiMutation(ACTUALIZAR_ORDEN, REFETCH);
	const [upload, uploading] = useApiMutation<{ registrarFotoOrden: { photoUrl: string } }>(UPLOAD_SIGNATURE);

	const field = (who: Who, kind: "DriverName" | "SignatureUrl") => `${who}${kind}`;

	const sign = (who: Who) => async (file: File) => {
		const data = await upload({
			workOrderId: order.workOrderId,
			stage: "Otro",
			category: who === "dropoff" ? "Firma entrega" : "Firma recepción",
			photoFile: file,
		});
		if (!data) return false;
		return Boolean(await update({ workOrderId: order.workOrderId, [field(who, "SignatureUrl")]: data.registrarFotoOrden.photoUrl }));
	};

	const cards: { who: Who; title: string; name: string; url: string | null }[] = [
		{ who: "dropoff", title: intl.formatMessage({ id: "handover.sign.dropoff", defaultMessage: "Firma de quien deja" }), name: order.dropoffDriverName ?? "", url: order.dropoffSignatureUrl },
		{ who: "pickup", title: intl.formatMessage({ id: "handover.sign.pickup", defaultMessage: "Firma de quien recoge" }), name: order.pickupDriverName ?? "", url: order.pickupSignatureUrl },
	];

	return (
		<section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
			<h2 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
				{intl.formatMessage({ id: "handover.title", defaultMessage: "Acta de entrega" })}
			</h2>
			<div className="flex flex-col gap-3">
				{cards.map((c) => (
					<SignatureCard
						key={c.who}
						id={`ho-${c.who}`}
						title={c.title}
						name={c.name}
						signatureUrl={c.url}
						readOnly={readOnly}
						saving={uploading || updating}
						onNameCommit={(name) => update({ workOrderId: order.workOrderId, [field(c.who, "DriverName")]: name || null })}
						onSign={sign(c.who)}
					/>
				))}
			</div>
		</section>
	);
}
