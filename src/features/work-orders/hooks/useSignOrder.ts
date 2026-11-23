import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { UPLOAD_SIGNATURE } from "../api/handover";
import { GUARDAR_FIRMA_ENTREGA, GUARDAR_FIRMA_RECOGE } from "../api/mutations";

/** Sube la firma como foto de la orden y guarda su URL en la orden (entrada = quien deja, salida = quien recoge). */
export function useSignOrder(who: "dropoff" | "pickup") {
	const [upload, uploading] = useApiMutation<{ registrarFotoOrden: { photoUrl: string } }>(UPLOAD_SIGNATURE);
	// Solo toca la firma de quien firma; la otra firma y los nombres no se envían.
	const [save, saving] = useApiMutation(who === "dropoff" ? GUARDAR_FIRMA_ENTREGA : GUARDAR_FIRMA_RECOGE);

	const sign = async (workOrderId: number, file: File) => {
		const data = await upload({
			workOrderId,
			stage: "Otro",
			category: who === "dropoff" ? "Firma entrega" : "Firma recepción",
			photoFile: file,
		});
		if (!data) return false;
		return Boolean(await save({ workOrderId, url: data.registrarFotoOrden.photoUrl }));
	};
	return { sign, signing: uploading || saving };
}
