import { useIntl } from "react-intl";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { Checklist } from "../hooks/useChecklist";
import type { FormGroup } from "../types";
import { FIELD_REGISTRY } from "./fields";
import ItemNote from "./ItemNote";

type Props = Pick<Checklist, "values" | "notes" | "setValue" | "setNote"> & { groups: FormGroup[] };

/**
 * Todo el checklist en una pantalla, por excepción: los sí/no empiezan en "bien" y solo se tocan los que tienen problema.
 * Toda la fila del sí/no es tocable (la etiqueta apunta al switch). Un problema se marca con icono y fondo, no solo color.
 */
export default function ChecklistBoard({ groups, values, notes, setValue, setNote }: Props) {
	const intl = useIntl();
	const problem = intl.formatMessage({ id: "inspection.problem", defaultMessage: "Con problema" });

	return (
		<div className={`gap-3 ${groups.length > 1 ? "columns-1 md:columns-2" : ""}`}>
			{groups.map((g, gi) => (
				<section key={g.category?.name ?? gi} className="mb-3 break-inside-avoid rounded-2xl border border-gray-200 p-3 dark:border-gray-800">
					<h2 className="mb-1 px-1 text-sm font-semibold text-gray-800 dark:text-white/90">{g.category?.name}</h2>
					<ul className="flex flex-col">
						{g.items.map(({ item }) => {
							const Field = FIELD_REGISTRY[item.inputType] ?? FIELD_REGISTRY.text;
							const value = values[item.itemId] ?? "";
							const field = Field({ item, value, onChange: (v) => setValue(item.itemId, v) });
							const name = (
								<label htmlFor={`item-${item.itemId}`} className="min-w-0 flex-1 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
									{item.name}
									{item.isRequired && <span aria-hidden> *</span>}
								</label>
							);
							if (item.inputType !== "checkbox")
								return (
									<li key={item.itemId} className="flex flex-col gap-1.5 px-1 py-2">
										{name}
										{field}
									</li>
								);
							const bad = value === "false";
							return (
								<li
									key={item.itemId}
									className={`flex min-h-12 items-center gap-2 rounded-lg px-1 ${bad ? "bg-amber-50 dark:bg-amber-500/10" : ""}`}
								>
									{bad && <ExclamationTriangleIcon className="size-5 shrink-0 text-amber-600" aria-label={problem} />}
									{name}
									{bad && <ItemNote title={item.name} value={notes[item.itemId] ?? ""} onChange={(v) => setNote(item.itemId, v)} />}
									{field}
								</li>
							);
						})}
					</ul>
				</section>
			))}
		</div>
	);
}
