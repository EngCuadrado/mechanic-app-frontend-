import { useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useIntl } from "react-intl";
import { CameraIcon, PhotoIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import IconButton from "../../../shared/components/IconButton";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { shrinkImage } from "../../../shared/utils/image";
import { ELIMINAR_FOTO, GET_WORK_ORDER_PHOTOS, REGISTRAR_FOTO } from "../api/photos";
import { PHOTO_STAGES, type OrderPhoto, type PhotoStageGroup } from "../types";

interface Props {
	workOrderId: number;
	/** Orden cerrada: no se suben fotos. */
	canAdd: boolean;
	/** Solo falso en Entregado: las fotos son evidencia y no se borran. */
	canDelete: boolean;
	/** Etapa preseleccionada (Antes, Despues, Otro). */
	initialStage?: string;
}

const REFETCH = { refetchQueries: ["GetWorkOrderPhotos"] };

export default function PhotosSection({ workOrderId, canAdd, canDelete, initialStage = "Antes" }: Props) {
	const intl = useIntl();
	const [stage, setStage] = useState<string>(initialStage);
	const [viewing, setViewing] = useState<OrderPhoto | null>(null);
	const [deleting, setDeleting] = useState<OrderPhoto | null>(null);
	const camera = useRef<HTMLInputElement>(null);
	const gallery = useRef<HTMLInputElement>(null);
	const { data } = useQuery<{ workOrderPhotos: PhotoStageGroup[] }>(GET_WORK_ORDER_PHOTOS, { variables: { workOrderId } });
	const [upload, uploading] = useApiMutation(REGISTRAR_FOTO, REFETCH);
	const [remove, removing] = useApiMutation(ELIMINAR_FOTO, REFETCH);

	const onFiles = async (files: FileList | null) => {
		if (!files) return;
		for (const f of Array.from(files)) {
			await upload({ workOrderId, stage, photoFile: await shrinkImage(f) });
		}
	};

	const label = (s: string) => intl.formatMessage({ id: `photos.stage.${s}`, defaultMessage: s });
	const groups = data?.workOrderPhotos ?? [];

	return (
		<section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
			{canAdd && (
				<div className="mb-4 flex flex-col gap-3">
					<input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
					<input ref={gallery} type="file" accept="image/*" multiple hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
					<div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-100 p-1 dark:bg-white/[0.05]" role="radiogroup">
						{PHOTO_STAGES.map((s) => (
							<button
								key={s}
								type="button"
								role="radio"
								aria-checked={stage === s}
								onClick={() => setStage(s)}
								className={`min-h-12 cursor-pointer rounded-xl text-sm font-semibold ${
									stage === s ? "bg-white text-brand-500 shadow-sm dark:bg-gray-800" : "text-gray-600 dark:text-gray-400"
								}`}
							>
								{label(s)} <span className="font-normal opacity-70">{groups.find((g) => g.stage === s)?.photos.length ?? 0}</span>
							</button>
						))}
					</div>
					<div className="flex gap-2">
						<IconButton
							variant="primary"
							showLabel
							className="min-h-14 flex-1 text-base"
							disabled={uploading}
							icon={<CameraIcon className="size-6" />}
							label={intl.formatMessage(
								uploading ? { id: "photos.uploading", defaultMessage: "Subiendo…" } : { id: "photos.camera", defaultMessage: "Tomar foto" },
							)}
							onClick={() => camera.current?.click()}
						/>
						<IconButton
							variant="outline"
							showLabel
							className="min-h-14"
							disabled={uploading}
							icon={<PhotoIcon className="size-6" />}
							label={intl.formatMessage({ id: "photos.galleryShort", defaultMessage: "Galería" })}
							onClick={() => gallery.current?.click()}
						/>
					</div>
				</div>
			)}
			{groups.length === 0 && (
				<p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
					{intl.formatMessage({ id: "photos.empty", defaultMessage: "Aún no hay fotos" })}
				</p>
			)}
			{groups.map((g) => (
				<div key={g.stage} className="mb-3">
					<p className="mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{label(g.stage)}</p>
					<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
						{g.photos.map((p) => (
							<li key={p.workOrderPhotoId} className="relative">
								<button type="button" onClick={() => setViewing(p)} className="block aspect-square w-full cursor-pointer overflow-hidden rounded-xl">
									<img src={p.photoUrl} alt={p.category ?? label(g.stage)} loading="lazy" className="size-full object-cover" />
								</button>
								{canDelete && (
									<button
										type="button"
										aria-label={intl.formatMessage({ id: "common.remove", defaultMessage: "Quitar" })}
										title={intl.formatMessage({ id: "common.remove", defaultMessage: "Quitar" })}
										onClick={() => setDeleting(p)}
										className="absolute right-1 top-1 flex size-11 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white"
									>
										<TrashIcon className="size-5" />
									</button>
								)}
							</li>
						))}
					</ul>
				</div>
			))}
			{viewing && (
				<div role="dialog" aria-modal className="fixed inset-0 z-900 flex items-center justify-center bg-black/90 p-4" onClick={() => setViewing(null)}>
					<img src={viewing.photoUrl} alt="" className="max-h-full max-w-full object-contain" />
					<button
						type="button"
						aria-label={intl.formatMessage({ id: "common.close", defaultMessage: "Cerrar" })}
						title={intl.formatMessage({ id: "common.close", defaultMessage: "Cerrar" })}
						className="absolute right-3 top-3 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white"
					>
						<XMarkIcon className="size-6" />
					</button>
				</div>
			)}
			<ConfirmDialog
				isOpen={deleting !== null}
				danger
				loading={removing}
				title={intl.formatMessage({ id: "photos.delete", defaultMessage: "Quitar foto" })}
				message={intl.formatMessage({ id: "photos.delete.confirm", defaultMessage: "La foto se eliminará de la orden." })}
				confirmLabel={intl.formatMessage({ id: "common.remove", defaultMessage: "Quitar" })}
				onConfirm={async () => {
					if (deleting && (await remove({ workOrderPhotoId: deleting.workOrderPhotoId }))) setDeleting(null);
				}}
				onClose={() => setDeleting(null)}
			/>
		</section>
	);
}
