import { useEffect, useRef, useState } from "react";
import { EXTRA_ANGLE, missingAngles } from "../angles";
import type { AnglePhotosView, OrderPhoto, PendingShot } from "../types";

interface Shot extends PendingShot {
	id: number;
	url: string;
}

const toPhoto = (s: Shot): OrderPhoto => ({ workOrderPhotoId: s.id, photoUrl: s.url, category: s.angle, vehicleInspectionId: null });

/**
 * Fotos guiadas guardadas en el dispositivo hasta que exista la orden (recepción en una pantalla).
 * Repetir un ángulo reemplaza la toma; las extras se acumulan. Las vistas previas se liberan al salir.
 */
export function useLocalAnglePhotos(): AnglePhotosView & { shots: PendingShot[] } {
	const [shots, setShots] = useState<Shot[]>([]);
	const latest = useRef(shots);
	latest.current = shots;
	const nextId = useRef(-1); // ids negativos: nunca chocan con los del servidor

	useEffect(() => () => latest.current.forEach((s) => URL.revokeObjectURL(s.url)), []);

	const take = (angle: string, file: File) => {
		const replaced = angle === EXTRA_ANGLE ? undefined : latest.current.find((s) => s.angle === angle);
		if (replaced) URL.revokeObjectURL(replaced.url);
		const shot = { id: nextId.current--, angle, file, url: URL.createObjectURL(file) };
		setShots((cur) => [...cur.filter((s) => s !== replaced), shot]);
	};

	const byAngle = Object.fromEntries(shots.filter((s) => s.angle !== EXTRA_ANGLE).map((s) => [s.angle, toPhoto(s)]));
	return {
		byAngle,
		compare: {},
		extras: shots.filter((s) => s.angle === EXTRA_ANGLE).map(toPhoto),
		missing: missingAngles(byAngle),
		uploading: [],
		take,
		shots: shots.map(({ angle, file }) => ({ angle, file })),
	};
}
