import type { ReactNode } from "react";

export interface TabItem {
	id: string;
	label: string;
	icon: ReactNode;
	count?: number;
}

interface Props {
	tabs: TabItem[];
	value: string;
	onChange: (id: string) => void;
}

/** Pestañas táctiles con icono y texto; en pantalla chica se deslizan a los lados dentro de su fila. */
export default function Tabs({ tabs, value, onChange }: Props) {
	return (
		<div role="tablist" className="flex gap-2 overflow-x-auto pb-1">
			{tabs.map((t) => (
				<button
					key={t.id}
					type="button"
					role="tab"
					aria-selected={value === t.id}
					onClick={() => onChange(t.id)}
					className={`inline-flex min-h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-semibold ${
						value === t.id
							? "border-brand-500 bg-brand-500 text-white"
							: "border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
					}`}
				>
					<span className="size-5 shrink-0 [&>svg]:size-5">{t.icon}</span>
					{t.label}
					{t.count !== undefined && (
						<span className={`rounded-full px-2 text-xs ${value === t.id ? "bg-white/25" : "bg-gray-100 dark:bg-white/10"}`}>{t.count}</span>
					)}
				</button>
			))}
		</div>
	);
}
