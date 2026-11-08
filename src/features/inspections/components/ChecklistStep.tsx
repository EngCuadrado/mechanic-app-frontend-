import { PhotoCaptureButton } from "../../photos";
import type { Checklist } from "../hooks/useChecklist";
import type { FormGroup } from "../types";
import { FIELD_REGISTRY } from "./fields";
import ItemNote from "./ItemNote";

interface Props {
	group: FormGroup;
	checklist: Checklist;
	workOrderId: number;
	/** Etapa de las fotos: Antes (entrada) o Despues (salida). */
	photoStage: "Antes" | "Despues";
}

/** Los ítems de una categoría. Cada uno se resuelve con el campo de su tipo; nota y foto son opcionales. */
export default function ChecklistStep({ group, checklist, workOrderId, photoStage }: Props) {
	return (
		<ul className="flex flex-col gap-3">
			{group.items.map(({ item }) => {
				const Field = FIELD_REGISTRY[item.inputType] ?? FIELD_REGISTRY.text;
				const inline = item.inputType === "checkbox";
				return (
					<li key={item.itemId} className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
						<label htmlFor={`item-${item.itemId}`} className="font-medium text-gray-800 dark:text-white/90">
							{item.name}
							{item.isRequired && <span aria-hidden> *</span>}
						</label>
						{!inline && Field({ item, value: checklist.values[item.itemId] ?? "", onChange: (v) => checklist.setValue(item.itemId, v) })}
						<div className="flex items-center justify-between gap-3">
							{inline ? Field({ item, value: checklist.values[item.itemId] ?? "", onChange: (v) => checklist.setValue(item.itemId, v) }) : <span />}
							<div className="flex gap-2">
								<ItemNote title={item.name} value={checklist.notes[item.itemId] ?? ""} onChange={(v) => checklist.setNote(item.itemId, v)} />
								<PhotoCaptureButton workOrderId={workOrderId} stage={photoStage} category={item.name} vehicleInspectionId={checklist.inspectionId} />
							</div>
						</div>
					</li>
				);
			})}
		</ul>
	);
}
