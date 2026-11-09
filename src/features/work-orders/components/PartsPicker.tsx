import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useIntl } from "react-intl";
import Input from "../../../components/form/input/InputField";
import QuantityStepper from "../../../shared/components/QuantityStepper";
import { SEARCH_PARTS } from "../../../shared/api/pickers";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { formatMoney } from "../../../shared/utils/format";

interface Part {
	inventoryPartId: number;
	name: string;
	stockQuantity: number;
	basePrice: number | null;
}

interface Props {
	/** partId → cantidad elegida. */
	selected: Record<number, number>;
	onChange: (selected: Record<number, number>) => void;
}

/** Buscador de repuestos con selección múltiple: tocar una fila la elige (cantidad 1 con −/+), tocarla otra vez la quita. */
// shortcut: muestra los primeros 30 resultados, sin "cargar más"; se busca escribiendo.
export default function PartsPicker({ selected, onChange }: Props) {
	const intl = useIntl();
	const [text, setText] = useState("");
	const search = useDebouncedValue(text.trim(), 300);
	const { data, loading, error } = useQuery<{ inventoryParts: { nodes: Part[] } }>(SEARCH_PARTS, {
		variables: { first: 30, where: search ? { name: { contains: search } } : undefined },
	});
	const parts = data?.inventoryParts.nodes ?? [];

	const toggle = (p: Part) => {
		const next = { ...selected };
		if (p.inventoryPartId in next) delete next[p.inventoryPartId];
		else next[p.inventoryPartId] = 1;
		onChange(next);
	};

	return (
		<div className="flex flex-col gap-3">
			<Input
				type="search"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder={intl.formatMessage({ id: "workOrder.searchPart", defaultMessage: "Buscar repuesto" })}
				aria-label={intl.formatMessage({ id: "workOrder.searchPart", defaultMessage: "Buscar repuesto" })}
			/>
			{loading && !data && <p className="text-sm text-gray-500 dark:text-gray-400">{intl.formatMessage({ id: "common.loading", defaultMessage: "Cargando…" })}</p>}
			{error && <p role="alert" className="text-sm text-red-600">{intl.formatMessage({ id: "common.loadError", defaultMessage: "No se pudo cargar la información" })}</p>}
			{data && parts.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">{intl.formatMessage({ id: "workOrder.noParts", defaultMessage: "No hay repuestos" })}</p>}
			<ul className="flex flex-col gap-2">
				{parts.map((p) => {
					const on = p.inventoryPartId in selected;
					const out = p.stockQuantity <= 0;
					return (
						<li
							key={p.inventoryPartId}
							className={`flex items-center gap-2 rounded-xl border ${on ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-800"}`}
						>
							<button
								type="button"
								disabled={out}
								aria-pressed={on}
								onClick={() => toggle(p)}
								className="min-h-14 min-w-0 flex-1 cursor-pointer px-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
							>
								<span className="block truncate text-sm font-medium text-gray-800 dark:text-white/90">{p.name}</span>
								<span className="block text-xs text-gray-500 dark:text-gray-400">
									{intl.formatMessage({ id: "inventory.stockShort", defaultMessage: "Stock" })}: {p.stockQuantity} · {formatMoney(p.basePrice)}
								</span>
							</button>
							{on && (
								<div className="pr-1">
									<QuantityStepper
										value={selected[p.inventoryPartId]}
										max={p.stockQuantity}
										onChange={(q) => onChange({ ...selected, [p.inventoryPartId]: q })}
									/>
								</div>
							)}
						</li>
					);
				})}
			</ul>
		</div>
	);
}
