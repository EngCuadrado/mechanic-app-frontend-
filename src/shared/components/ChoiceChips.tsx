import { CheckIcon } from "@heroicons/react/24/solid";

interface Props {
	options: { value: string; label: string }[];
	value: string | null;
	onChange: (value: string) => void;
	ariaLabel: string;
	disabled?: boolean;
}

/** Elegir una opción tocando un botón grande (sin escribir). El elegido lleva color y un check, no solo color. */
export default function ChoiceChips({ options, value, onChange, ariaLabel, disabled }: Props) {
	return (
		<div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
			{options.map((o) => {
				const on = value === o.value;
				return (
					<button
						key={o.value}
						type="button"
						role="radio"
						aria-checked={on}
						disabled={disabled}
						onClick={() => onChange(o.value)}
						className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
							on
								? "border-brand-500 bg-brand-500 text-white"
								: "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
						}`}
					>
						{on && <CheckIcon className="size-4" aria-hidden />}
						{o.label}
					</button>
				);
			})}
		</div>
	);
}
