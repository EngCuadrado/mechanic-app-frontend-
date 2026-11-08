import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { ArrowUturnLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import IconButton from "./IconButton";

interface Props {
	/** Recibe la firma como PNG. */
	onSave: (file: File) => void;
	saving?: boolean;
}

/** Lienzo táctil para firmar con el dedo (pointer events: sirve con dedo, lápiz y mouse). */
export default function SignaturePad({ onSave, saving }: Props) {
	const intl = useIntl();
	const canvas = useRef<HTMLCanvasElement>(null);
	const drawing = useRef(false);
	const [empty, setEmpty] = useState(true);

	useEffect(() => {
		const c = canvas.current!;
		const ratio = window.devicePixelRatio || 1;
		c.width = c.offsetWidth * ratio;
		c.height = c.offsetHeight * ratio;
		const ctx = c.getContext("2d")!;
		ctx.scale(ratio, ratio);
		ctx.lineWidth = 2.5;
		ctx.lineCap = "round";
		ctx.strokeStyle = "#111827";
	}, []);

	const pos = (e: React.PointerEvent) => {
		const r = canvas.current!.getBoundingClientRect();
		return { x: e.clientX - r.left, y: e.clientY - r.top };
	};

	const start = (e: React.PointerEvent) => {
		drawing.current = true;
		canvas.current!.setPointerCapture(e.pointerId);
		const { x, y } = pos(e);
		const ctx = canvas.current!.getContext("2d")!;
		ctx.beginPath();
		ctx.moveTo(x, y);
	};

	const move = (e: React.PointerEvent) => {
		if (!drawing.current) return;
		const { x, y } = pos(e);
		const ctx = canvas.current!.getContext("2d")!;
		ctx.lineTo(x, y);
		ctx.stroke();
		setEmpty(false);
	};

	const clear = () => {
		const c = canvas.current!;
		c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
		setEmpty(true);
	};

	const save = () =>
		canvas.current!.toBlob((b) => b && onSave(new File([b], "firma.png", { type: "image/png" })), "image/png");

	return (
		<div className="flex flex-col gap-3">
			<canvas
				ref={canvas}
				aria-label={intl.formatMessage({ id: "signature.area", defaultMessage: "Área de firma" })}
				onPointerDown={start}
				onPointerMove={move}
				onPointerUp={() => (drawing.current = false)}
				className="h-40 w-full touch-none rounded-xl border border-dashed border-gray-400 bg-white"
			/>
			<div className="flex gap-2">
				<IconButton
					variant="outline"
					showLabel
					icon={<ArrowUturnLeftIcon className="size-5" />}
					label={intl.formatMessage({ id: "signature.clear", defaultMessage: "Borrar" })}
					onClick={clear}
				/>
				<IconButton
					variant="primary"
					showLabel
					disabled={empty || saving}
					icon={<CheckIcon className="size-5" />}
					label={intl.formatMessage({ id: "common.save", defaultMessage: "Guardar" })}
					onClick={save}
				/>
			</div>
		</div>
	);
}
