import { Link } from "react-router";
import { useIntl } from "react-intl";
import ChoiceChips from "../../../shared/components/ChoiceChips";
import EntityPicker from "../../../shared/components/EntityPicker";
import { SEARCH_VEHICLES } from "../../../shared/api/pickers";
import Label from "../../../components/form/Label";
import { SERVICE_CATALOG, serviceMessageId } from "../constants";

export interface PickedVehicle {
	vehicleId: number;
	plate: string | null;
	model?: { modelName: string; brand?: { brandName: string } | null } | null;
}

interface Props {
	vehicle: PickedVehicle | null;
	onVehicle: (v: PickedVehicle | null) => void;
	/** Lo que se le va a hacer (claves de SERVICE_CATALOG). */
	services: string[];
	onServices: (keys: string[]) => void;
	/** Orden abierta del vehículo elegido: no se puede recibir otra. */
	openOrderId?: number | null;
}

const vehicleName = (v: PickedVehicle) => [v.model?.brand?.brandName, v.model?.modelName].filter(Boolean).join(" ");

/** Recepción: placa y lo que se le va a hacer (chips, se pueden elegir varios). */
export default function VehicleStep({ vehicle, onVehicle, services, onServices, openOrderId }: Props) {
	const intl = useIntl();
	const toggle = (k: string) => onServices(services.includes(k) ? services.filter((s) => s !== k) : [...services, k]);
	const workLabel = intl.formatMessage({ id: "workOrder.reception.work", defaultMessage: "¿Qué se le va a hacer?" });
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
			{openOrderId != null && (
				<div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
					<span>{intl.formatMessage({ id: "workOrder.openExists", defaultMessage: "Este vehículo ya tiene una orden abierta" })}</span>
					<Link to={`/ordenes/${openOrderId}`} className="flex min-h-11 shrink-0 items-center font-semibold underline">
						{intl.formatMessage({ id: "workOrder.openExists.view", defaultMessage: "Ver orden" })}
					</Link>
				</div>
			)}
			<div className="flex flex-col gap-2">
				<Label>{workLabel}</Label>
				<ChoiceChips
					ariaLabel={workLabel}
					value={services}
					onChange={toggle}
					options={SERVICE_CATALOG.map((k) => ({ value: k, label: intl.formatMessage({ id: serviceMessageId(k), defaultMessage: k }) }))}
				/>
			</div>
		</div>
	);
}
