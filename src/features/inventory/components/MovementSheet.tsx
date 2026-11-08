import { useState } from "react";
import { useIntl } from "react-intl";
import { CheckIcon } from "@heroicons/react/24/outline";
import BottomSheet from "../../../shared/components/BottomSheet";
import IconButton from "../../../shared/components/IconButton";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { toNumber } from "../../../shared/utils/format";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { REGISTRAR_MOVIMIENTO } from "../api/movements";
import { MANUAL_MOVEMENT_TYPES } from "../constants";

interface Props {
	partId: number;
	isOpen: boolean;
	onClose: () => void;
}

/** Registrar Compra / Ajuste / Inicial. Los movimientos nunca se editan: un error se corrige con un Ajuste. */
export default function MovementSheet({ partId, isOpen, onClose }: Props) {
	const intl = useIntl();
	const [type, setType] = useState<string>("Compra");
	const [quantity, setQuantity] = useState("");
	const [unitCost, setUnitCost] = useState("");
	const [save, saving] = useApiMutation(REGISTRAR_MOVIMIENTO, {
		refetchQueries: ["GetInventoryMovements", "GetInventoryPartStock", "GetStockCheck"],
	});

	const qty = toNumber(quantity);
	// Compra/Inicial positivos; Ajuste puede ser negativo pero no cero (el backend también lo valida).
	const valid = qty !== null && Number.isInteger(qty) && qty !== 0 && (type === "Ajuste" || qty > 0);

	const submit = async () => {
		const ok = await save({ partId, movementType: type, quantity: qty, unitCost: toNumber(unitCost) });
		if (ok) {
			setQuantity("");
			setUnitCost("");
			onClose();
		}
	};

	return (
		<BottomSheet
			isOpen={isOpen}
			onClose={onClose}
			title={intl.formatMessage({ id: "inventory.movement.new", defaultMessage: "Registrar movimiento" })}
		>
			<div className="flex flex-col gap-4">
				<div className="flex gap-2" role="radiogroup">
					{MANUAL_MOVEMENT_TYPES.map((t) => (
						<button
							key={t}
							type="button"
							role="radio"
							aria-checked={type === t}
							onClick={() => setType(t)}
							className={`min-h-11 flex-1 cursor-pointer rounded-full border px-4 text-sm font-medium ${
								type === t
									? "border-brand-500 bg-brand-500 text-white"
									: "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
							}`}
						>
							{intl.formatMessage({ id: `inventory.movement.type.${t}`, defaultMessage: t })}
						</button>
					))}
				</div>
				<div>
					<Label htmlFor="mv-qty">{intl.formatMessage({ id: "common.quantity", defaultMessage: "Cantidad" })}</Label>
					<Input id="mv-qty" type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
				</div>
				<div>
					<Label htmlFor="mv-cost">{intl.formatMessage({ id: "inventory.movement.unitCost", defaultMessage: "Costo unitario (opcional)" })}</Label>
					<Input id="mv-cost" type="number" inputMode="decimal" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
				</div>
				<IconButton
					variant="primary"
					showLabel
					disabled={!valid || saving}
					icon={<CheckIcon className="size-5" />}
					label={intl.formatMessage({ id: "common.save", defaultMessage: "Guardar" })}
					onClick={submit}
				/>
			</div>
		</BottomSheet>
	);
}
