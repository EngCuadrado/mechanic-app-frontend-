import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "sonner";
import { CheckIcon } from "@heroicons/react/24/outline";
import BottomSheet from "../../../shared/components/BottomSheet";
import IconButton from "../../../shared/components/IconButton";
import SegmentedControl from "../../../shared/components/SegmentedControl";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { AGREGAR_SERVICIO, EDITAR_SERVICIO } from "../api/itemMutations";
import { useAddParts } from "../hooks/useAddParts";
import type { WorkOrderPart, WorkOrderService } from "../types";
import PartsPicker from "./PartsPicker";
import ServiceForm, { useServiceDraft } from "./ServiceForm";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	workOrderId: number;
	parts: WorkOrderPart[];
	/** Con un servicio, la hoja lo edita (sin selector ni repuestos). */
	editService?: WorkOrderService | null;
}

const REFETCH = { refetchQueries: ["GetWorkOrder", "GetWorkOrders"] };

/** Una sola hoja para agregar trabajo: Servicio o Repuestos. El botón principal queda fijo abajo y dice qué falta. */
export default function AddWorkSheet(props: Props) {
	// Cada apertura empieza limpia.
	const [session, setSession] = useState(0);
	useEffect(() => {
		if (props.isOpen) setSession((s) => s + 1);
	}, [props.isOpen]);
	return <Inner key={`${session}-${props.editService?.workOrderServiceId ?? "new"}`} {...props} />;
}

function Inner({ isOpen, onClose, workOrderId, parts, editService }: Props) {
	const intl = useIntl();
	const [tab, setTab] = useState("service");
	const [selected, setSelected] = useState<Record<number, number>>({});
	const draft = useServiceDraft(
		editService
			? {
					description: editService.description ?? "",
					price: editService.price,
					internalCost: editService.internalCost,
					mechanicId: editService.mechanicId,
				}
			: undefined,
	);
	const [addService, addingService] = useApiMutation(AGREGAR_SERVICIO, REFETCH);
	const [editServiceMutation, editingService] = useApiMutation(EDITAR_SERVICIO, REFETCH);
	const { addParts, adding } = useAddParts(parts);

	const count = Object.keys(selected).length;
	const isService = tab === "service";
	const hintId = isService ? (draft.missing && `workOrder.add.missing.${draft.missing}`) : count === 0 && "workOrder.add.missing.pickPart";
	const busy = addingService || editingService || adding;

	const submit = async () => {
		if (isService) {
			const ok = editService
				? await editServiceMutation({ workOrderServiceId: editService.workOrderServiceId, ...draft.values })
				: await addService({ workOrderId, ...draft.values });
			if (ok) done();
			return;
		}
		const failed = await addParts(
			workOrderId,
			Object.entries(selected).map(([partId, quantity]) => ({ partId: Number(partId), quantity })),
		);
		// Lo que falló sigue elegido para reintentar o ajustar; lo demás ya quedó en la orden.
		if (failed.length === 0) return done();
		setSelected((cur) => Object.fromEntries(Object.entries(cur).filter(([id]) => failed.includes(Number(id)))));
	};
	const done = () => {
		toast.success(intl.formatMessage({ id: "workOrder.add.done", defaultMessage: "Agregado" }));
		onClose();
	};

	const label = editService
		? intl.formatMessage({ id: "common.save", defaultMessage: "Guardar" })
		: isService
			? intl.formatMessage({ id: "workOrder.addService", defaultMessage: "Agregar servicio" })
			: intl.formatMessage({ id: "workOrder.add.parts", defaultMessage: "Agregar {count} repuestos" }, { count });

	return (
		<BottomSheet
			isOpen={isOpen}
			onClose={onClose}
			title={intl.formatMessage(
				editService
					? { id: "workOrder.editService", defaultMessage: "Editar servicio" }
					: { id: "workOrder.add", defaultMessage: "Agregar" },
			)}
			footer={
				<div className="flex flex-col gap-2">
					{hintId && (
						<p role="status" className="text-center text-xs text-gray-500 dark:text-gray-400">
							{intl.formatMessage({ id: hintId })}
						</p>
					)}
					<IconButton
						variant="primary"
						showLabel
						className="w-full"
						disabled={!!hintId || busy}
						icon={<CheckIcon className="size-5" />}
						label={label}
						onClick={submit}
					/>
				</div>
			}
		>
			<div className="flex flex-col gap-4">
				{!editService && (
					<SegmentedControl
						ariaLabel={intl.formatMessage({ id: "workOrder.add", defaultMessage: "Agregar" })}
						value={tab}
						onChange={setTab}
						options={[
							{ value: "service", label: intl.formatMessage({ id: "workOrder.add.service", defaultMessage: "Servicio" }) },
							{ value: "part", label: intl.formatMessage({ id: "workOrder.add.part", defaultMessage: "Repuesto" }) },
						]}
					/>
				)}
				{isService ? <ServiceForm draft={draft} /> : <PartsPicker selected={selected} onChange={setSelected} />}
			</div>
		</BottomSheet>
	);
}
