import { useIntl } from "react-intl";
import { WORK_ORDER_STATUSES, statusMessageId } from "../constants";
import { statusStyle } from "./StatusBadge";

interface Props {
	counts: Record<string, number>;
	/** Estado elegido, o null para ver todas. */
	value: string | null;
	onChange: (status: string | null) => void;
}

/** Una tarjeta por estado con su contador. Tocar filtra; tocar la elegida otra vez quita el filtro. */
export default function StatusFilter({ counts, value, onChange }: Props) {
	const intl = useIntl();
	return (
		<div role="group" aria-label={intl.formatMessage({ id: "workOrder.filterByStatus", defaultMessage: "Filtrar por estado" })} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
			{WORK_ORDER_STATUSES.map((s) => (
				<button
					key={s}
					type="button"
					aria-pressed={value === s}
					onClick={() => onChange(value === s ? null : s)}
					className={`flex min-h-[76px] cursor-pointer flex-col justify-between rounded-2xl border-2 p-3 text-left ${statusStyle(s).tile} ${
						value === s ? statusStyle(s).ring : "border-transparent"
					}`}
				>
					<span className="text-3xl leading-none font-bold">{counts[s] ?? 0}</span>
					<span className="text-sm font-semibold">{intl.formatMessage({ id: statusMessageId(s), defaultMessage: s })}</span>
				</button>
			))}
		</div>
	);
}
