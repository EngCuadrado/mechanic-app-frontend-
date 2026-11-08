import { useQuery } from "@apollo/client/react";
import { useIntl } from "react-intl";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { GET_STOCK_CHECK } from "../api/movements";

/** Aviso de consistencia: el stock de cada repuesto debe coincidir con la suma de sus movimientos. */
export default function StockCheckBadge() {
	const intl = useIntl();
	const { data } = useQuery<{ inventoryStockCheck: { isConsistent: boolean } }>(GET_STOCK_CHECK);
	if (!data) return null;
	const ok = data.inventoryStockCheck.isConsistent;
	const Icon = ok ? CheckCircleIcon : ExclamationTriangleIcon;
	return (
		<span className={`inline-flex items-center gap-1 text-xs font-medium ${ok ? "text-emerald-600" : "text-red-600"}`}>
			<Icon className="size-4" />
			{intl.formatMessage(
				ok
					? { id: "inventory.stockCheck.ok", defaultMessage: "Stock consistente" }
					: { id: "inventory.stockCheck.bad", defaultMessage: "Stock inconsistente" },
			)}
		</span>
	);
}
