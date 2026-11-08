import { useIntl } from "react-intl";
import ChoiceChips from "../../../shared/components/ChoiceChips";
import EntityPicker from "../../../shared/components/EntityPicker";
import { SEARCH_VEHICLES } from "../../../shared/api/pickers";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { ORDER_REASONS, reasonMessageId } from "../constants";

export interface PickedVehicle {
	vehicleId: number;
	plate: string | null;
	model?: { modelName: string; brand?: { brandName: string } | null } | null;
}

interface Props {
	vehicle: PickedVehicle | null;
	onVehicle: (v: PickedVehicle | null) => void;
	reason: string | null;
	onReason: (r: string) => void;
	driver: string;
	onDriver: (d: string) => void;
}

const vehicleName = (v: PickedVehicle) => [v.model?.brand?.brandName, v.model?.modelName].filter(Boolean).join(" ");

/** Paso 1 de la recepción: placa, motivo (lista fija) y quien lo trae (único texto). */
export default function VehicleStep({ vehicle, onVehicle, reason, onReason, driver, onDriver }: Props) {
	const intl = useIntl();
	return (
		<div className="flex flex-col gap-5">
			{vehicle ? (
				<button
					type="button"
					onClick={() => onVehicle(null)}
					className="min-h-14 cursor-pointer rounded-xl border border-gray-200 px-4 text-left dark:border-gray-800"
				>
					<span className="block text-xl font-bold text-gray-800 dark:text-white/90">{vehicle.plate}</span>
					<span className="block text-sm text-gray-500 dark:text-gray-400">{vehicleName(vehicle)}</span>
				</button>
			) : (
				<EntityPicker<PickedVehicle>
					query={SEARCH_VEHICLES}
					field="vehicles"
					idKey="vehicleId"
					placeholder={intl.formatMessage({ id: "workOrder.searchVehicle", defaultMessage: "Buscar por placa" })}
					buildWhere={(text) => (text ? { plate: { contains: text } } : undefined)}
					renderItem={(v) => (
						<>
							<p className="font-semibold text-gray-800 dark:text-white/90">{v.plate}</p>
							<p className="text-sm text-gray-500 dark:text-gray-400">{vehicleName(v)}</p>
						</>
					)}
					onSelect={onVehicle}
				/>
			)}
			<div className="flex flex-col gap-2">
				<Label>{intl.formatMessage({ id: "workOrder.reception.reason", defaultMessage: "Motivo" })}</Label>
				<ChoiceChips
					ariaLabel={intl.formatMessage({ id: "workOrder.reception.reason", defaultMessage: "Motivo" })}
					value={reason}
					onChange={onReason}
					options={ORDER_REASONS.map((r) => ({ value: r, label: intl.formatMessage({ id: reasonMessageId(r) }) }))}
				/>
			</div>
			<div>
				<Label htmlFor="rec-driver">{intl.formatMessage({ id: "workOrder.reception.driver", defaultMessage: "Quien lo trae" })}</Label>
				<Input id="rec-driver" value={driver} onChange={(e) => onDriver(e.target.value)} />
			</div>
		</div>
	);
}
