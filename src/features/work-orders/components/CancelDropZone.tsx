import { useDroppable } from "@dnd-kit/core";
import { useIntl } from "react-intl";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const CANCEL_ZONE_ID = "cancel";

/** Zona fija abajo que aparece mientras se arrastra una orden: soltarla aquí la cancela (con confirmación). */
export default function CancelDropZone() {
	const intl = useIntl();
	const { setNodeRef, isOver } = useDroppable({ id: CANCEL_ZONE_ID });
	return (
		<div
			ref={setNodeRef}
			role="region"
			aria-label={intl.formatMessage({ id: "workOrder.cancel", defaultMessage: "Cancelar orden" })}
			className={`fixed inset-x-4 bottom-4 z-40 mx-auto flex min-h-20 max-w-xl items-center justify-center gap-3 rounded-2xl border-2 border-dashed text-base font-semibold transition-colors ${
				isOver
					? "border-error-600 bg-error-600 text-white"
					: "border-error-500 bg-white/95 text-error-600 dark:bg-gray-900/95 dark:text-error-400"
			}`}
		>
			<XMarkIcon className="size-7" aria-hidden />
			{intl.formatMessage({ id: "workOrder.cancel.drop", defaultMessage: "Suelta aquí para cancelar" })}
		</div>
	);
}
