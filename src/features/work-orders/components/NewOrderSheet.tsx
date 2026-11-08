import { useState } from "react";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { CheckIcon } from "@heroicons/react/24/outline";
import BottomSheet from "../../../shared/components/BottomSheet";
import EntityPicker from "../../../shared/components/EntityPicker";
import IconButton from "../../../shared/components/IconButton";
import { SEARCH_VEHICLES } from "../../../shared/api/pickers";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { CREAR_ORDEN } from "../api/mutations";
import { WORK_ORDER_TYPES, typeMessageId } from "../constants";

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

interface PickedVehicle {
	vehicleId: number;
	plate: string | null;
	model?: { modelName: string; brand?: { brandName: string } | null } | null;
}

/** Crear una orden: elegir vehículo → tipo → problema. Dos toques para lo frecuente. */
export default function NewOrderSheet({ isOpen, onClose }: Props) {
	const intl = useIntl();
	const navigate = useNavigate();
	const [vehicle, setVehicle] = useState<PickedVehicle | null>(null);
	const [type, setType] = useState<string>("Correctivo");
	const [issue, setIssue] = useState("");
	const [driver, setDriver] = useState("");
	const [create, saving] = useApiMutation<{ crearOrden: { workOrderId: number } }>(CREAR_ORDEN, {
		refetchQueries: ["GetWorkOrders"],
	});

	const close = () => {
		setVehicle(null);
		setIssue("");
		setDriver("");
		onClose();
	};

	const submit = async () => {
		if (!vehicle) return;
		const data = await create({
			vehicleId: vehicle.vehicleId,
			type,
			reportedIssue: issue.trim() || null,
			dropoffDriverName: driver.trim() || null,
		});
		if (data) {
			close();
			navigate(`/ordenes/${data.crearOrden.workOrderId}`);
		}
	};

	return (
		<BottomSheet
			isOpen={isOpen}
			onClose={close}
			title={intl.formatMessage({ id: "workOrder.new", defaultMessage: "Nueva orden" })}
		>
			{!vehicle ? (
				<EntityPicker<PickedVehicle>
					query={SEARCH_VEHICLES}
					field="vehicles"
					idKey="vehicleId"
					placeholder={intl.formatMessage({ id: "workOrder.searchVehicle", defaultMessage: "Buscar por placa" })}
					buildWhere={(text) => (text ? { plate: { contains: text } } : undefined)}
					renderItem={(v) => (
						<>
							<p className="font-semibold text-gray-800 dark:text-white/90">{v.plate}</p>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{[v.model?.brand?.brandName, v.model?.modelName].filter(Boolean).join(" ")}
							</p>
						</>
					)}
					onSelect={setVehicle}
				/>
			) : (
				<div className="flex flex-col gap-4">
					<button
						type="button"
						onClick={() => setVehicle(null)}
						className="min-h-11 cursor-pointer rounded-xl border border-gray-200 px-4 text-left font-semibold text-gray-800 dark:border-gray-800 dark:text-white/90"
					>
						{vehicle.plate} · {[vehicle.model?.brand?.brandName, vehicle.model?.modelName].filter(Boolean).join(" ")}
					</button>
					<div className="flex flex-wrap gap-2" role="radiogroup">
						{WORK_ORDER_TYPES.map((t) => (
							<button
								key={t}
								type="button"
								role="radio"
								aria-checked={type === t}
								onClick={() => setType(t)}
								className={`min-h-11 cursor-pointer rounded-full border px-4 text-sm font-medium ${
									type === t
										? "border-brand-500 bg-brand-500 text-white"
										: "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
								}`}
							>
								{intl.formatMessage({ id: typeMessageId(t), defaultMessage: t })}
							</button>
						))}
					</div>
					<div>
						<Label htmlFor="wo-issue">{intl.formatMessage({ id: "workOrder.reportedIssue", defaultMessage: "Problema reportado" })}</Label>
						<Input id="wo-issue" value={issue} onChange={(e) => setIssue(e.target.value)} />
					</div>
					<div>
						<Label htmlFor="wo-driver">{intl.formatMessage({ id: "workOrder.dropoffDriver", defaultMessage: "Quien lo deja" })}</Label>
						<Input id="wo-driver" value={driver} onChange={(e) => setDriver(e.target.value)} />
					</div>
					<IconButton
						variant="primary"
						showLabel
						disabled={saving}
						icon={<CheckIcon className="size-5" />}
						label={intl.formatMessage({ id: "workOrder.create", defaultMessage: "Crear orden" })}
						onClick={submit}
					/>
				</div>
			)}
		</BottomSheet>
	);
}
