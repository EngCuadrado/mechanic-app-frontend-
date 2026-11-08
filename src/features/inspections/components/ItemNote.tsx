import { useState } from "react";
import { useIntl } from "react-intl";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import BottomSheet from "../../../shared/components/BottomSheet";
import IconButton from "../../../shared/components/IconButton";
import TextArea from "../../../components/form/input/TextArea";

interface Props {
	title: string;
	value: string;
	onChange: (value: string) => void;
}

/** Nota opcional de un ítem: icono que abre un panel con el campo. Se ve resaltado si ya tiene nota. */
export default function ItemNote({ title, value, onChange }: Props) {
	const intl = useIntl();
	const [open, setOpen] = useState(false);
	return (
		<>
			<IconButton
				variant={value ? "primary" : "outline"}
				icon={<PencilSquareIcon />}
				label={intl.formatMessage({ id: "inspection.note", defaultMessage: "Nota" })}
				onClick={() => setOpen(true)}
			/>
			<BottomSheet isOpen={open} onClose={() => setOpen(false)} title={title}>
				<TextArea rows={3} value={value} onChange={onChange} />
			</BottomSheet>
		</>
	);
}
