import { useState } from "react";
import { useIntl } from "react-intl";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import BottomSheet from "../../../shared/components/BottomSheet";
import IconButton from "../../../shared/components/IconButton";
import SignaturePad from "../../../shared/components/SignaturePad";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
	id: string;
	title: string;
	name: string;
	signatureUrl: string | null;
	readOnly: boolean;
	saving: boolean;
	onNameCommit: (name: string) => void;
	onSign: (file: File) => Promise<boolean>;
}

/** Nombre + firma de una persona. Tocar "Firmar" abre un lienzo grande y al aceptar se guarda solo. */
export default function SignatureCard({ id, title, name, signatureUrl, readOnly, saving, onNameCommit, onSign }: Props) {
	const intl = useIntl();
	const [value, setValue] = useState(name);
	const [signing, setSigning] = useState(false);

	return (
		<div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
			<p className="text-sm font-semibold text-gray-800 dark:text-white/90">{title}</p>
			<div>
				<Label htmlFor={id}>{intl.formatMessage({ id: "common.name", defaultMessage: "Nombre" })}</Label>
				<Input id={id} value={value} disabled={readOnly} onChange={(e) => setValue(e.target.value)} onBlur={() => value.trim() !== name && onNameCommit(value.trim())} />
			</div>
			{signatureUrl ? (
				<img src={signatureUrl} alt={intl.formatMessage({ id: "signature.of", defaultMessage: "Firma" })} className="h-24 w-full rounded-xl border border-gray-200 bg-white object-contain dark:border-gray-700" />
			) : (
				<div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-700">
					{intl.formatMessage({ id: "signature.none", defaultMessage: "Sin firma" })}
				</div>
			)}
			{!readOnly && (
				<IconButton
					variant={signatureUrl ? "outline" : "primary"}
					showLabel
					disabled={saving}
					icon={<PencilSquareIcon className="size-5" />}
					label={intl.formatMessage(
						signatureUrl ? { id: "signature.redo", defaultMessage: "Firmar de nuevo" } : { id: "workOrder.sign", defaultMessage: "Firmar" },
					)}
					onClick={() => setSigning(true)}
				/>
			)}
			<BottomSheet isOpen={signing} onClose={() => setSigning(false)} title={title}>
				<SignaturePad
					heightClass="h-64"
					saving={saving}
					onSave={async (file) => {
						if (await onSign(file)) setSigning(false);
					}}
				/>
			</BottomSheet>
		</div>
	);
}
