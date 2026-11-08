import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useIntl } from "react-intl";
import IconButton from "./IconButton";

interface QuantityStepperProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	disabled?: boolean;
}

/** Cantidad con botones − y + grandes; el número también se puede escribir con teclado numérico. */
export default function QuantityStepper({ value, onChange, min = 1, max, disabled }: QuantityStepperProps) {
	const intl = useIntl();
	const clamp = (n: number) => Math.min(max ?? Number.MAX_SAFE_INTEGER, Math.max(min, n));
	return (
		<div className="inline-flex items-center gap-1">
			<IconButton
				variant="outline"
				icon={<MinusIcon />}
				label={intl.formatMessage({ id: "common.decrease", defaultMessage: "Disminuir" })}
				disabled={disabled || value <= min}
				onClick={() => onChange(clamp(value - 1))}
			/>
			<input
				type="number"
				inputMode="numeric"
				aria-label={intl.formatMessage({ id: "common.quantity", defaultMessage: "Cantidad" })}
				className="h-11 w-16 rounded-xl border border-gray-300 bg-transparent text-center text-base dark:border-gray-700 dark:text-white/90"
				value={value}
				min={min}
				max={max}
				disabled={disabled}
				onChange={(e) => onChange(clamp(Math.trunc(Number(e.target.value) || min)))}
			/>
			<IconButton
				variant="outline"
				icon={<PlusIcon />}
				label={intl.formatMessage({ id: "common.increase", defaultMessage: "Aumentar" })}
				disabled={disabled || (max !== undefined && value >= max)}
				onClick={() => onChange(clamp(value + 1))}
			/>
		</div>
	);
}
