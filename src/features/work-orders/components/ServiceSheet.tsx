import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { CheckIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import BottomSheet from "../../../shared/components/BottomSheet";
import EntityPicker from "../../../shared/components/EntityPicker";
import ChoiceChips from "../../../shared/components/ChoiceChips";
import IconButton from "../../../shared/components/IconButton";
import { SEARCH_MECHANICS } from "../../../shared/api/pickers";
import { toNumber } from "../../../shared/utils/format";
import Input from "../../../components/form/input/InputField";
import { SERVICE_CATALOG, serviceMessageId } from "../constants";
import Label from "../../../components/form/Label";

export interface PickedMechanic {
	mechanicId: number;
	firstName: string | null;
	lastName: string | null;
}

export interface ServiceValues {
	description: string;
	internalCost: number;
	price: number;
	mechanic: PickedMechanic | null;
}

interface Props {
	isOpen: boolean;
	onClose: () => void;
	/** Con valores iniciales edita; sin ellos crea. */
	initialValues?: ServiceValues;
	saving: boolean;
	onSubmit: (values: ServiceValues) => void;
}

export const mechanicName = (m: PickedMechanic) => `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim();

/** Formulario de servicio para crear y editar: descripción, costo, precio y mecánico (solo activos, del servidor). */
export default function ServiceSheet({ isOpen, onClose, initialValues, saving, onSubmit }: Props) {
	const intl = useIntl();
	const [description, setDescription] = useState("");
	const [internalCost, setInternalCost] = useState("");
	const [price, setPrice] = useState("");
	const [mechanic, setMechanic] = useState<PickedMechanic | null>(null);
	const [pickingMechanic, setPickingMechanic] = useState(false);

	useEffect(() => {
		if (!isOpen) return;
		setDescription(initialValues?.description ?? "");
		setInternalCost(initialValues ? String(initialValues.internalCost) : "");
		setPrice(initialValues ? String(initialValues.price) : "");
		setMechanic(initialValues?.mechanic ?? null);
	}, [isOpen, initialValues]);

	// Si el servicio que se edita tiene una descripción fuera del catálogo, se conserva como opción.
	const options = SERVICE_CATALOG.map((k) => intl.formatMessage({ id: serviceMessageId(k) })).map((l) => ({ value: l, label: l }));
	if (description && !options.some((o) => o.value === description)) options.push({ value: description, label: description });
	const cost = toNumber(internalCost);
	const unit = toNumber(price);
	const valid = description.trim() !== "" && cost !== null && unit !== null;
	const title = intl.formatMessage(
		initialValues
			? { id: "workOrder.editService", defaultMessage: "Editar servicio" }
			: { id: "workOrder.addService", defaultMessage: "Agregar servicio" },
	);

	return (
		<BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<Label>{intl.formatMessage({ id: "workOrder.serviceDescription", defaultMessage: "Descripción" })}</Label>
					<ChoiceChips
						ariaLabel={intl.formatMessage({ id: "workOrder.serviceDescription", defaultMessage: "Descripción" })}
						value={description || null}
						onChange={setDescription}
						options={options}
					/>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<Label htmlFor="svc-cost">{intl.formatMessage({ id: "workOrder.internalCost", defaultMessage: "Costo" })}</Label>
						<Input id="svc-cost" type="number" inputMode="decimal" value={internalCost} onChange={(e) => setInternalCost(e.target.value)} />
					</div>
					<div>
						<Label htmlFor="svc-price">{intl.formatMessage({ id: "workOrder.price", defaultMessage: "Precio" })}</Label>
						<Input id="svc-price" type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
					</div>
				</div>
				<div>
					<Label>{intl.formatMessage({ id: "workOrder.mechanic", defaultMessage: "Mecánico" })}</Label>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setPickingMechanic(true)}
							className="flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 text-left text-sm dark:border-gray-700 dark:text-white/90"
						>
							<UserIcon className="size-5 shrink-0" />
							<span className="truncate">
								{mechanic ? mechanicName(mechanic) : intl.formatMessage({ id: "workOrder.selectMechanic", defaultMessage: "Seleccionar mecánico" })}
							</span>
						</button>
						{mechanic && (
							<IconButton
								icon={<XMarkIcon className="size-5" />}
								label={intl.formatMessage({ id: "workOrder.clearMechanic", defaultMessage: "Quitar mecánico" })}
								onClick={() => setMechanic(null)}
							/>
						)}
					</div>
				</div>
				<IconButton
					variant="primary"
					showLabel
					disabled={!valid || saving}
					icon={<CheckIcon className="size-5" />}
					label={intl.formatMessage({ id: "common.save", defaultMessage: "Guardar" })}
					onClick={() => valid && onSubmit({ description: description.trim(), internalCost: cost, price: unit, mechanic })}
				/>
			</div>
			<BottomSheet
				isOpen={pickingMechanic}
				onClose={() => setPickingMechanic(false)}
				title={intl.formatMessage({ id: "workOrder.selectMechanic", defaultMessage: "Seleccionar mecánico" })}
			>
				<EntityPicker<PickedMechanic>
					query={SEARCH_MECHANICS}
					field="mechanics"
					idKey="mechanicId"
					placeholder={intl.formatMessage({ id: "workOrder.searchMechanic", defaultMessage: "Buscar mecánico" })}
					buildWhere={(text) => ({
						isActive: { eq: true },
						...(text && { or: [{ firstName: { contains: text } }, { lastName: { contains: text } }] }),
					})}
					renderItem={(m) => <span className="font-medium text-gray-800 dark:text-white/90">{mechanicName(m)}</span>}
					onSelect={(m) => {
						setMechanic(m);
						setPickingMechanic(false);
					}}
				/>
			</BottomSheet>
		</BottomSheet>
	);
}
