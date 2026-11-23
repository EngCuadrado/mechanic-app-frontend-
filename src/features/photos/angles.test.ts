import { describe, expect, it } from "vitest";
import { extraPhotos, missingAngles, photosByAngle } from "./angles";
import type { PhotoStageGroup } from "./types";

const photo = (workOrderPhotoId: number, category: string | null) => ({ workOrderPhotoId, photoUrl: `u${workOrderPhotoId}`, category, vehicleInspectionId: null });
const groups: PhotoStageGroup[] = [
	{ stage: "Antes", photos: [photo(1, "front"), photo(5, "front"), photo(2, "back"), photo(3, "extra"), photo(4, "Frente")] },
	{ stage: "Despues", photos: [photo(9, "left")] },
];

describe("photosByAngle", () => {
	it("toma la foto más nueva de cada ángulo", () => expect(photosByAngle(groups, "Antes").front.workOrderPhotoId).toBe(5));
	it("solo mira la etapa pedida", () => expect(Object.keys(photosByAngle(groups, "Despues"))).toEqual(["left"]));
	it("ignora categorías que no son ángulos", () => expect(Object.keys(photosByAngle(groups, "Antes")).sort()).toEqual(["back", "front"]));
	it("etapa sin fotos da vacío", () => expect(photosByAngle(groups, "Otro")).toEqual({}));
});

describe("missingAngles", () => {
	it("pide las 4 exteriores que faltan, no el tablero", () => expect(missingAngles(photosByAngle(groups, "Antes"))).toEqual(["left", "right"]));
});

describe("extraPhotos", () => {
	it("devuelve las fotos extra de la etapa", () => expect(extraPhotos(groups, "Antes").map((p) => p.workOrderPhotoId)).toEqual([3]));
});
