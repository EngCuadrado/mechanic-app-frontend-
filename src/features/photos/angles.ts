import type { OrderPhoto, PhotoStageGroup } from "./types";

/** Tomas fijas de recepción y entrega (se guardan en `category`). Textos en es.json (photos.angle.*). */
export const PHOTO_ANGLES = ["front", "back", "left", "right", "dash"] as const;
/** Exteriores: sin ellas no se avanza. Tablero y extras son opcionales. */
export const REQUIRED_ANGLES: readonly string[] = ["front", "back", "left", "right"];
/** Fotos libres (golpes, detalles): sin límite. */
export const EXTRA_ANGLE = "extra";

export const angleMessageId = (angle: string) => `photos.angle.${angle}`;

/** Fotos de una etapa con la categoría pedida, de la más nueva a la más vieja. */
const ofStage = (groups: PhotoStageGroup[], stage: string, category: (c: string | null) => boolean): OrderPhoto[] =>
	(groups.find((g) => g.stage === stage)?.photos ?? [])
		.filter((p) => category(p.category))
		.sort((a, b) => b.workOrderPhotoId - a.workOrderPhotoId);

/** Foto de cada ángulo en una etapa. Si una toma se repitió, cuenta la más nueva. */
export function photosByAngle(groups: PhotoStageGroup[], stage: string): Record<string, OrderPhoto> {
	const byAngle: Record<string, OrderPhoto> = {};
	for (const angle of PHOTO_ANGLES) {
		const [latest] = ofStage(groups, stage, (c) => c === angle);
		if (latest) byAngle[angle] = latest;
	}
	return byAngle;
}

export const extraPhotos = (groups: PhotoStageGroup[], stage: string) => ofStage(groups, stage, (c) => c === EXTRA_ANGLE);

export const missingAngles = (byAngle: Record<string, OrderPhoto>) => REQUIRED_ANGLES.filter((a) => !byAngle[a]);
