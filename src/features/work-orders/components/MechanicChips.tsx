import { useQuery } from "@apollo/client/react";
import { useIntl } from "react-intl";
import ChoiceChips from "../../../shared/components/ChoiceChips";
import { SEARCH_MECHANICS } from "../../../shared/api/pickers";

interface Props {
	value: number | null;
	onChange: (id: number | null) => void;
}

interface Mechanic {
	mechanicId: number;
	firstName: string | null;
	lastName: string | null;
}

/** Mecánicos activos como botones (hasta 12). Tocar el elegido lo quita. */
// shortcut: tope de 12 sin buscador, agregar buscador si el taller tiene más mecánicos.
export default function MechanicChips({ value, onChange }: Props) {
	const intl = useIntl();
	const { data, loading, error } = useQuery<{ mechanics: { nodes: Mechanic[] } }>(SEARCH_MECHANICS, {
		variables: { first: 12, where: { isActive: { eq: true } } },
	});
	const nodes = data?.mechanics.nodes ?? [];
	if (loading) return <p className="text-sm text-gray-500 dark:text-gray-400">{intl.formatMessage({ id: "common.loading", defaultMessage: "Cargando…" })}</p>;
	if (error || nodes.length === 0)
		return <p className="text-sm text-gray-500 dark:text-gray-400">{intl.formatMessage({ id: error ? "common.loadError" : "workOrder.noMechanic", defaultMessage: "Sin mecánico" })}</p>;
	return (
		<ChoiceChips
			ariaLabel={intl.formatMessage({ id: "workOrder.mechanic", defaultMessage: "Mecánico" })}
			value={value === null ? null : String(value)}
			onChange={(v) => onChange(Number(v) === value ? null : Number(v))}
			options={nodes.map((m) => ({ value: String(m.mechanicId), label: `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() }))}
		/>
	);
}
