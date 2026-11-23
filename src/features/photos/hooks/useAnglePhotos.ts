import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { shrinkImage } from "../../../shared/utils/image";
import { GET_WORK_ORDER_PHOTOS, REGISTRAR_FOTO } from "../api/photos";
import { extraPhotos, missingAngles, photosByAngle } from "../angles";
import type { PhotoStageGroup } from "../types";

interface Args {
	workOrderId: number;
	/** Antes (recepción) o Despues (entrega). */
	stage: string;
	/** Etapa con la que se compara cada toma (en la entrega: Antes). */
	compareStage?: string;
	vehicleInspectionId: number | null;
}

/** Fotos guiadas de una etapa: qué ángulo ya tiene foto, cuáles faltan y subir una toma (reducida) por ángulo. */
export function useAnglePhotos({ workOrderId, stage, compareStage, vehicleInspectionId }: Args) {
	const { data } = useQuery<{ workOrderPhotos: PhotoStageGroup[] }>(GET_WORK_ORDER_PHOTOS, { variables: { workOrderId } });
	const [upload] = useApiMutation(REGISTRAR_FOTO, { refetchQueries: ["GetWorkOrderPhotos"] });
	// Varias tomas pueden subir a la vez; cada casilla muestra la suya.
	const [uploading, setUploading] = useState<string[]>([]);

	const groups = data?.workOrderPhotos ?? [];
	const byAngle = photosByAngle(groups, stage);

	const take = async (angle: string, file: File) => {
		setUploading((u) => [...u, angle]);
		try {
			await upload({ workOrderId, stage, category: angle, vehicleInspectionId, photoFile: await shrinkImage(file) });
		} finally {
			setUploading((u) => u.filter((a, i) => i !== u.indexOf(angle)));
		}
	};

	return {
		byAngle,
		compare: compareStage ? photosByAngle(groups, compareStage) : {},
		extras: extraPhotos(groups, stage),
		missing: missingAngles(byAngle),
		uploading,
		take,
	};
}

export type AnglePhotos = ReturnType<typeof useAnglePhotos>;
