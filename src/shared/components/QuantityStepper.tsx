import { Button, Group, Input, NumberField } from "react-aria-components";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useIntl } from "react-intl";

interface QuantityStepperProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	disabled?: boolean;
}

const BTN =
	"flex size-12 cursor-pointer items-center justify-center text-gray-700 transition-colors hover:bg-gray-100 data-[pressed]:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-white/[0.06]";

/** Cantidad con − y + grandes (react-aria: teclado numérico, flechas y lectores de pantalla). */
export default function QuantityStepper({ value, onChange, min = 1, max, disabled }: QuantityStepperProps) {
	const intl = useIntl();
	return (
		<NumberField
			value={value}
			onChange={(n) => Number.isFinite(n) && onChange(n)}
			minValue={min}
			maxValue={max}
			isDisabled={disabled}
			formatOptions={{ maximumFractionDigits: 0, useGrouping: false }}
			aria-label={intl.formatMessage({ id: "common.quantity", defaultMessage: "Cantidad" })}
		>
			<Group className="inline-flex items-center overflow-hidden rounded-2xl border border-gray-300 bg-white focus-within:border-brand-500 dark:border-gray-700 dark:bg-gray-900">
				<Button slot="decrement" className={BTN}>
					<MinusIcon className="size-5" />
				</Button>
				<Input
					inputMode="numeric"
					className="h-12 w-14 border-x border-gray-200 bg-transparent text-center text-base font-semibold text-gray-800 outline-none dark:border-gray-800 dark:text-white/90"
				/>
				<Button slot="increment" className={BTN}>
					<PlusIcon className="size-5" />
				</Button>
			</Group>
		</NumberField>
	);
}
