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
