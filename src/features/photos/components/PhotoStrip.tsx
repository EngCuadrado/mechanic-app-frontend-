import { useQuery } from "@apollo/client/react";
import { GET_WORK_ORDER_PHOTOS } from "../api/photos";
import type { PhotoStageGroup } from "../types";

const SHOWN = 4;

/** Miniaturas de las fotos de la orden (las más nuevas primero) y cuántas más hay. Comparte caché con la galería. */
export default function PhotoStrip({ workOrderId }: { workOrderId: number }) {
	const { data } = useQuery<{ workOrderPhotos: PhotoStageGroup[] }>(GET_WORK_ORDER_PHOTOS, { variables: { workOrderId } });
	const photos = (data?.workOrderPhotos ?? []).flatMap((g) => g.photos).sort((a, b) => b.workOrderPhotoId - a.workOrderPhotoId);
	if (photos.length === 0) return null;
	return (
		<span className="flex items-center gap-1" aria-hidden>
			{photos.slice(0, SHOWN).map((p) => (
				<img key={p.workOrderPhotoId} src={p.photoUrl} alt="" loading="lazy" className="size-9 rounded-md object-cover" />
			))}
			{photos.length > SHOWN && <span className="px-1 text-xs font-semibold text-gray-500">+{photos.length - SHOWN}</span>}
		</span>
	);
}
