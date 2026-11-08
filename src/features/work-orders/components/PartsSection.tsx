import { useState } from "react";
import { useIntl } from "react-intl";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import BottomSheet from "../../../shared/components/BottomSheet";
import EntityPicker from "../../../shared/components/EntityPicker";
import IconButton from "../../../shared/components/IconButton";
import QuantityStepper from "../../../shared/components/QuantityStepper";
import { SEARCH_PARTS } from "../../../shared/api/pickers";
import { formatMoney } from "../../../shared/utils/format";
import { usePartsDraft } from "../hooks/usePartsDraft";
import type { WorkOrderPart } from "../types";

interface Props {
	workOrderId: number;
	parts: WorkOrderPart[];
	/** Entregado/Cancelado: solo lectura (Cancelado deja quitar para devolver stock). */
	canAdd: boolean;
	canEdit: boolean;
	canRemove: boolean;
}

interface PickedPart {
	inventoryPartId: number;
	name: string;
	stockQuantity: number;
	basePrice: number | null;
}

export default function PartsSection({ workOrderId, parts, canAdd, canEdit, canRemove }: Props) {
	const intl = useIntl();
	const [picking, setPicking] = useState(false);
	const { rows, add, setQuantity, remove, saving, pending } = usePartsDraft(workOrderId, parts);

	const pick = (p: PickedPart) => {
		add({ partId: p.inventoryPartId, name: p.name, unitPrice: p.basePrice });
		setPicking(false);
	};

	return (
		<section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
			<div className="mb-3 flex items-center justify-between gap-3">
				<h2 className="font-semibold text-gray-800 dark:text-white/90">
					{intl.formatMessage({ id: "workOrder.parts", defaultMessage: "Repuestos" })}
				</h2>
				<div className="flex items-center gap-3">
					{(saving || pending) && (
						<span role="status" className="text-xs text-gray-500 dark:text-gray-400">
							{intl.formatMessage({ id: "common.saving", defaultMessage: "Guardando…" })}
						</span>
					)}
					{canAdd && (
						<IconButton
							variant="primary"
							showLabel
							icon={<PlusIcon className="size-5" />}
							label={intl.formatMessage({ id: "workOrder.addPart", defaultMessage: "Agregar repuesto" })}
							onClick={() => setPicking(true)}
						/>
					)}
				</div>
			</div>
			<ul className="flex flex-col gap-3">
				{rows.map((r) => (
					<li key={r.key} className="flex items-center justify-between gap-3">
						<div className="min-w-0">
							<p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{r.name}</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{formatMoney(r.unitPrice)} × {r.quantity}
							</p>
						</div>
						<div className="flex items-center gap-1">
							{canEdit && <QuantityStepper value={r.quantity} onChange={(q) => setQuantity(r.key, q)} />}
							{canRemove && (
								<IconButton
									variant="ghost"
									icon={<TrashIcon className="size-5 text-red-600" />}
									label={intl.formatMessage({ id: "common.remove", defaultMessage: "Quitar" })}
									onClick={() => remove(r.key)}
								/>
							)}
						</div>
					</li>
				))}
			</ul>
			<BottomSheet
				isOpen={picking}
				onClose={() => setPicking(false)}
				title={intl.formatMessage({ id: "workOrder.addPart", defaultMessage: "Agregar repuesto" })}
			>
				<EntityPicker<PickedPart>
					query={SEARCH_PARTS}
					field="inventoryParts"
					idKey="inventoryPartId"
					placeholder={intl.formatMessage({ id: "workOrder.searchPart", defaultMessage: "Buscar repuesto" })}
					buildWhere={(text) => (text ? { name: { contains: text } } : undefined)}
					renderItem={(p) => (
						<div className="flex justify-between gap-3">
							<span className="font-medium text-gray-800 dark:text-white/90">{p.name}</span>
							<span className="text-sm text-gray-500 dark:text-gray-400">
								{intl.formatMessage({ id: "inventory.stockShort", defaultMessage: "Stock" })}: {p.stockQuantity}
							</span>
						</div>
					)}
					onSelect={pick}
				/>
			</BottomSheet>
		</section>
	);
}
