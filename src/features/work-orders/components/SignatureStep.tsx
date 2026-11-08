import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import IconButton from "../../../shared/components/IconButton";
import SignaturePad from "../../../shared/components/SignaturePad";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
	/** Si se pasa, se pide el nombre de quien firma. */
	name?: string;
	onName?: (name: string) => void;
	nameLabel?: string;
	signed: boolean;
	saving: boolean;
	onSign: (file: File) => Promise<boolean>;
	onRedo: () => void;
}

/** Firma con el dedo (y nombre opcional). Al guardar muestra la firma; "Firmar de nuevo" vuelve al lienzo. */
export default function SignatureStep({ name, onName, nameLabel, signed, saving, onSign, onRedo }: Props) {
	const intl = useIntl();
	const [preview, setPreview] = useState<string | null>(null);
	useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

	return (
		<div className="flex flex-col gap-4">
			{onName && (
				<div>
					<Label htmlFor="sig-name">{nameLabel}</Label>
					<Input id="sig-name" value={name ?? ""} onChange={(e) => onName(e.target.value)} />
				</div>
			)}
			{signed && preview ? (
				<>
					<img src={preview} alt={intl.formatMessage({ id: "signature.of", defaultMessage: "Firma" })} className="h-40 w-full rounded-xl border border-gray-200 bg-white object-contain dark:border-gray-700" />
					<IconButton
						variant="outline"
						showLabel
						icon={<ArrowUturnLeftIcon />}
						label={intl.formatMessage({ id: "signature.redo", defaultMessage: "Firmar de nuevo" })}
						onClick={() => { setPreview(null); onRedo(); }}
					/>
				</>
			) : (
				<SignaturePad
					heightClass="h-56"
					saving={saving}
					onSave={async (file) => {
						if (await onSign(file)) setPreview(URL.createObjectURL(file));
					}}
				/>
			)}
		</div>
	);
}
