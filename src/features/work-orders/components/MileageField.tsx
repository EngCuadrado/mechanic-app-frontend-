import { useIntl } from "react-intl";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
	value: string;
	onChange: (value: string) => void;
	/** Última lectura del carro; se muestra como referencia y el nuevo km no puede ser menor. */
	last: number | null;
}

/** Kilometraje con teclado numérico. Solo acepta dígitos. */
export default function MileageField({ value, onChange, last }: Props) {
	const intl = useIntl();
	const lastText = last !== null ? intl.formatNumber(last) : null;
	const tooLow = last !== null && value !== "" && Number(value) < last;
	return (
		<div>
			<Label htmlFor="inspection-km">{intl.formatMessage({ id: "inspection.mileage", defaultMessage: "Kilometraje" })}</Label>
			<Input
				id="inspection-km"
				type="text"
				inputMode="numeric"
				autoComplete="off"
				value={value}
				onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
				error={tooLow}
				hint={
					lastText === null
						? undefined
						: intl.formatMessage(
								tooLow
									? { id: "inspection.mileage.tooLow", defaultMessage: "No puede ser menor que el último: {km} km" }
									: { id: "inspection.mileage.last", defaultMessage: "Último: {km} km" },
								{ km: lastText },
							)
				}
			/>
		</div>
	);
}
