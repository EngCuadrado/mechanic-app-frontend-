import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { shrinkImage } from "../../../shared/utils/image";
import { REGISTRAR_FOTO } from "../api/photos";
import type { PendingShot } from "../types";

/** Sube fotos tomadas en el dispositivo (reducidas, en paralelo). Devuelve las que fallaron (el error ya se mostró). */
export function useUploadShots() {
	const [upload] = useApiMutation(REGISTRAR_FOTO, { refetchQueries: ["GetWorkOrderPhotos"] });
	return async (workOrderId: number, stage: string, vehicleInspectionId: number | null, shots: PendingShot[]): Promise<PendingShot[]> => {
		const done = await Promise.all(
			shots.map(async (s) => Boolean(await upload({ workOrderId, stage, category: s.angle, vehicleInspectionId, photoFile: await shrinkImage(s.file) }))),
		);
		return shots.filter((_, i) => !done[i]);
	};
}
