import { useQuery } from "@apollo/client/react";
import { GET_WORK_ORDER_PHOTOS } from "../api/photos";
import type { PhotoStageGroup } from "../types";

/** Cantidad de fotos de la orden por etapa (Antes, Despues, Otro). Comparte caché con PhotosSection. */
export function usePhotoCounts(workOrderId: number): Record<string, number> {
	const { data } = useQuery<{ workOrderPhotos: PhotoStageGroup[] }>(GET_WORK_ORDER_PHOTOS, { variables: { workOrderId } });
	return Object.fromEntries((data?.workOrderPhotos ?? []).map((g) => [g.stage, g.photos.length]));
}
