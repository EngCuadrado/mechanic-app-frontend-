import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { UPLOAD_SIGNATURE } from "../api/handover";
import { ACTUALIZAR_ORDEN } from "../api/mutations";

/** Sube la firma como foto de la orden y guarda su URL en la orden (entrada = quien deja, salida = quien recoge). */
export function useSignOrder(who: "dropoff" | "pickup") {
	const [upload, uploading] = useApiMutation<{ registrarFotoOrden: { photoUrl: string } }>(UPLOAD_SIGNATURE);
	const [update, updating] = useApiMutation(ACTUALIZAR_ORDEN);

	const sign = async (workOrderId: number, file: File) => {
		const data = await upload({
			workOrderId,
			stage: "Otro",
			category: who === "dropoff" ? "Firma entrega" : "Firma recepción",
			photoFile: file,
		});
		if (!data) return false;
		return Boolean(await update({ workOrderId, [`${who}SignatureUrl`]: data.registrarFotoOrden.photoUrl }));
	};
	return { sign, signing: uploading || updating };
}
