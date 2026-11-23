import { useRef } from "react";
import { useIntl } from "react-intl";
import { ArrowPathIcon, CameraIcon, PlusIcon } from "@heroicons/react/24/outline";
import { angleMessageId, EXTRA_ANGLE, PHOTO_ANGLES, REQUIRED_ANGLES } from "../angles";
import type { AnglePhotosView, OrderPhoto } from "../types";

interface Props {
	photos: AnglePhotosView;
	/** Texto de la miniatura de comparación (ej. "Entrada"). Sin él no se compara. */
	compareLabel?: string;
}

const TILE = "relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border text-sm font-medium disabled:cursor-wait";

/** Casillas de tomas fijas: tocar abre la cámara; con foto, tocar la toma de nuevo (cuenta la más nueva). Extras sin límite. */
export default function GuidedPhotos({ photos, compareLabel }: Props) {
	const intl = useIntl();
	const input = useRef<HTMLInputElement>(null);
	const target = useRef<string>(EXTRA_ANGLE);
	const t = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage });

	const open = (angle: string) => {
		target.current = angle;
		input.current?.click();
	};

	const tile = (angle: string, photo: OrderPhoto | undefined, compare?: OrderPhoto) => {
		const label = t(angleMessageId(angle), angle);
		const busy = photos.uploading.includes(angle);
		const required = REQUIRED_ANGLES.includes(angle);
		const missing = required && !photo;
		return (
			<li key={angle}>
				<button
					type="button"
					disabled={busy}
					onClick={() => open(angle)}
					// "Foto:" distingue la toma "Atrás" del botón de volver (mismo texto).
					aria-label={`${t("photos.photo", "Foto")}: ${label}${photo ? ` (${t("photos.retake", "tomar de nuevo")})` : ""}`}
					title={label}
					className={`${TILE} ${
						photo
							? "border-transparent"
							: missing
								? "border-dashed border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
								: "border-dashed border-gray-300 text-gray-500 dark:border-gray-700 dark:text-gray-400"
					}`}
				>
					{photo ? (
						<>
							<img src={photo.photoUrl} alt="" className="absolute inset-0 size-full object-cover" />
							<span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/55 px-2 py-1 text-xs text-white">
								{label}
								<ArrowPathIcon className="size-4" aria-hidden />
							</span>
						</>
					) : (
						<>
							{/* Sin foto aún: la de entrada de fondo, atenuada, sirve de guía para repetir el mismo ángulo. */}
							{compare && <img src={compare.photoUrl} alt="" className="absolute inset-0 size-full object-cover opacity-25" />}
							<CameraIcon className="relative size-7" aria-hidden />
							<span className="relative">{label}</span>
							{required && <span className="relative text-xs font-normal">{t("photos.required", "Obligatoria")}</span>}
						</>
					)}
					{photo && compare && compareLabel && (
						<img
							src={compare.photoUrl}
							alt={`${compareLabel}: ${label}`}
							title={compareLabel}
							className="absolute right-1 top-1 aspect-[4/3] w-12 rounded-md border-2 border-white object-cover shadow"
						/>
					)}
					{busy && (
						<span className="absolute inset-0 flex items-center justify-center bg-white/70 text-gray-700 dark:bg-gray-900/70 dark:text-gray-200">
							{t("photos.uploading", "Subiendo…")}
						</span>
					)}
				</button>
			</li>
		);
	};

	return (
		<section aria-label={t("photos.title", "Fotos")}>
			<input
				ref={input}
				type="file"
				accept="image/*"
				capture="environment"
				hidden
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) photos.take(target.current, file);
					e.target.value = "";
				}}
			/>
			<ul className="grid grid-cols-3 gap-2">
				{PHOTO_ANGLES.map((a) => tile(a, photos.byAngle[a], photos.compare[a]))}
				{photos.extras.map((p) => (
					<li key={p.workOrderPhotoId}>
						<img src={p.photoUrl} alt={t(angleMessageId(EXTRA_ANGLE), "Otra foto")} className="aspect-[4/3] w-full rounded-xl object-cover" />
					</li>
				))}
				<li>
					<button
						type="button"
						disabled={photos.uploading.includes(EXTRA_ANGLE)}
						onClick={() => open(EXTRA_ANGLE)}
						className={`${TILE} border-dashed border-gray-300 text-gray-500 dark:border-gray-700 dark:text-gray-400`}
					>
						<PlusIcon className="size-7" aria-hidden />
						<span>{t(angleMessageId(EXTRA_ANGLE), "Otra foto")}</span>
					</button>
				</li>
			</ul>
		</section>
	);
}
