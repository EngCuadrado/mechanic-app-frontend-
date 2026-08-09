import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
	id: string;
	mode?: "single" | "multiple" | "range" | "time";
	onChange?: Hook | Hook[];
	defaultDate?: DateOption;
	value?: string | Date | Date[];
	label?: string;
	placeholder?: string;
};

export default function DatePicker({
	id,
	mode,
	onChange,
	label,
	defaultDate,
	value,
	placeholder,
}: PropsType) {
	const inputRef = useRef<HTMLInputElement>(null);
	const fp = useRef<flatpickr.Instance | null>(null);

	useEffect(() => {
		if (inputRef.current) {
			fp.current = flatpickr(inputRef.current, {
				mode: mode || "single",
				locale: {
					...Spanish,
					rangeSeparator: " al ",
				},
				monthSelectorType: "static",
				dateFormat: "d/m/Y",
				defaultDate: value || defaultDate,
				onChange,
				// Ensure the picker is appended to body to avoid overflow issues in drawers/modals
				static: false,
				disableMobile: true, // Better UI on desktop/tablets
			});
		}

		return () => {
			fp.current?.destroy();
		};
	}, [mode, id]); // Only re-init if mode or id changes

	// Sync value if it changes externally
	useEffect(() => {
		if (fp.current && value !== undefined) {
			fp.current.setDate(value, false);
		}
	}, [value]);

	return (
		<div className="w-full">
			{label && <Label htmlFor={id}>{label}</Label>}

			<div className="relative">
				<input
					id={id}
					ref={inputRef}
					placeholder={placeholder}
					readOnly // Flatpickr usually works better with readOnly on the input
					className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800 cursor-pointer"
				/>

				<span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
					<CalenderIcon className="size-6" />
				</span>
			</div>
		</div>
	);
}
