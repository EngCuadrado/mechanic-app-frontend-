interface Option {
	value: string;
	label: string;
}

interface Props {
	options: Option[];
	value: string;
	onChange: (value: string) => void;
	ariaLabel: string;
}

/** Selector de 2-3 opciones en una fila (Servicio | Repuesto). Siempre cabe, sin deslizar. */
export default function SegmentedControl({ options, value, onChange, ariaLabel }: Props) {
	return (
		<div role="tablist" aria-label={ariaLabel} className="flex rounded-xl bg-gray-100 p-1 dark:bg-white/5">
			{options.map((o) => (
				<button
					key={o.value}
					type="button"
					role="tab"
					aria-selected={value === o.value}
					onClick={() => onChange(o.value)}
					className={`min-h-11 flex-1 cursor-pointer rounded-lg px-3 text-sm font-semibold ${
						value === o.value
							? "bg-white text-brand-600 shadow-sm dark:bg-gray-800 dark:text-brand-400"
							: "text-gray-600 dark:text-gray-400"
					}`}
				>
					{o.label}
				</button>
			))}
		</div>
	);
}
