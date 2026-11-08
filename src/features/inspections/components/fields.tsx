import type { ReactNode } from "react";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import ChoiceChips from "../../../shared/components/ChoiceChips";
import type { ChecklistItem } from "../types";

export interface FieldProps {
	item: ChecklistItem;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

const inputField = (type: string, inputMode?: "numeric" | "decimal") =>
	function InputBased({ item, value, onChange, disabled }: FieldProps) {
		return (
			<Input id={`item-${item.itemId}`} type={type} inputMode={inputMode} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
		);
	};

function CheckboxField({ item, value, onChange, disabled }: FieldProps) {
	const on = value === "true";
	return (
		<button
			type="button"
			role="switch"
			aria-checked={on}
			aria-label={item.name}
			disabled={disabled}
			onClick={() => onChange(on ? "false" : "true")}
			className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors disabled:opacity-50 ${on ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"}`}
		>
			<span className={`absolute top-1 size-6 rounded-full bg-white transition-all ${on ? "left-7" : "left-1"}`} />
		</button>
	);
}

/** select y radio: botones grandes para elegir con el pulgar, sin escribir. */
function ChoiceField({ item, value, onChange, disabled }: FieldProps) {
	return (
		<ChoiceChips
			ariaLabel={item.name}
			disabled={disabled}
			value={value || null}
			onChange={onChange}
			options={(item.options ?? []).map((o) => ({ value: o, label: o }))}
		/>
	);
}

function TextareaField({ value, onChange, disabled }: FieldProps) {
	return <TextArea rows={2} value={value} disabled={disabled} onChange={onChange} />;
}

/** Registro por tipo de input del checklist: agregar un tipo = agregar una entrada, sin cadenas de if/switch. */
export const FIELD_REGISTRY: Record<string, (p: FieldProps) => ReactNode> = {
	text: inputField("text"),
	textarea: TextareaField,
	number: inputField("number", "decimal"),
	date: inputField("date"),
	checkbox: CheckboxField,
	select: ChoiceField,
	radio: ChoiceField,
};
