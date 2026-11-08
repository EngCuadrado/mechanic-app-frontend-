import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import { CameraIcon } from "@heroicons/react/24/outline";
import IconButton from "../../../shared/components/IconButton";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { shrinkImage } from "../../../shared/utils/image";
import { REGISTRAR_FOTO } from "../api/photos";

interface Props {
	workOrderId: number;
	stage: string;
	category?: string;
	vehicleInspectionId?: number | null;
}

/** Botón de cámara: toma una foto, la reduce y la sube ligada a la orden (y a la inspección si se indica). Muestra cuántas lleva. */
export default function PhotoCaptureButton({ workOrderId, stage, category, vehicleInspectionId }: Props) {
	const intl = useIntl();
	const input = useRef<HTMLInputElement>(null);
	const [count, setCount] = useState(0);
	const [upload, uploading] = useApiMutation(REGISTRAR_FOTO, { refetchQueries: ["GetWorkOrderPhotos"] });
	const label = intl.formatMessage({ id: "photos.camera", defaultMessage: "Tomar foto" });

	const onFile = async (file?: File) => {
		if (!file) return;
		const ok = await upload({ workOrderId, stage, category, vehicleInspectionId, photoFile: await shrinkImage(file) });
		if (ok) setCount((c) => c + 1);
	};

	return (
		<span className="relative inline-flex">
			<input
				ref={input}
				type="file"
				accept="image/*"
				capture="environment"
				hidden
				onChange={(e) => {
					onFile(e.target.files?.[0]);
					e.target.value = "";
				}}
			/>
			<IconButton variant="outline" disabled={uploading} icon={<CameraIcon />} label={label} onClick={() => input.current?.click()} />
			{count > 0 && (
				<span className="pointer-events-none absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
					{count}
				</span>
			)}
		</span>
	);
}
