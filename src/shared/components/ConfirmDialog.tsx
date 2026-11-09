import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useIntl } from "react-intl";
import BottomSheet from "./BottomSheet";
import IconButton from "./IconButton";

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmLabel: string;
	danger?: boolean;
	loading?: boolean;
	onConfirm: () => void;
	onClose: () => void;
}

/** Confirmación breve en hoja con dos botones grandes. Solo para acciones importantes (cancelar, entregar, quitar). */
export default function ConfirmDialog({
	isOpen,
	title,
	message,
	confirmLabel,
	danger = false,
	loading = false,
	onConfirm,
	onClose,
}: ConfirmDialogProps) {
	const intl = useIntl();
	return (
		<BottomSheet
			isOpen={isOpen}
			onClose={onClose}
			title={title}
			footer={
				<div className="flex gap-3">
					<IconButton
						variant="outline"
						className="flex-1"
						icon={<XMarkIcon />}
						label={intl.formatMessage({ id: "common.cancel", defaultMessage: "Cancelar" })}
						showLabel
						onClick={onClose}
						disabled={loading}
					/>
					<IconButton
						variant={danger ? "danger" : "primary"}
						className="flex-1"
						icon={<CheckIcon />}
						label={confirmLabel}
						showLabel
						onClick={onConfirm}
						disabled={loading}
					/>
				</div>
			}
		>
			<p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
		</BottomSheet>
	);
}
