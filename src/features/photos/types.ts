export interface OrderPhoto {
	workOrderPhotoId: number;
	photoUrl: string;
	category: string | null;
	vehicleInspectionId: number | null;
}

export interface PhotoStageGroup {
	stage: string;
	photos: OrderPhoto[];
}

export const PHOTO_STAGES = ["Antes", "Despues", "Otro"] as const;

/** Lo que pintan las casillas de fotos guiadas, venga del servidor (useAnglePhotos) o del dispositivo (useLocalAnglePhotos). */
export interface AnglePhotosView {
	byAngle: Record<string, OrderPhoto>;
	compare: Record<string, OrderPhoto>;
	extras: OrderPhoto[];
	/** Ángulos obligatorios sin foto. */
	missing: string[];
	/** Ángulos que se están subiendo. */
	uploading: string[];
	take: (angle: string, file: File) => void | Promise<void>;
}

/** Una foto tomada en el dispositivo, aún sin subir. */
export interface PendingShot {
	angle: string;
	file: File;
}
