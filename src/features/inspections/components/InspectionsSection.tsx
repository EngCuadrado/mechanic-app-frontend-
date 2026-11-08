import { Link } from "react-router";
import { useIntl } from "react-intl";
import { ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import IconButton from "../../../shared/components/IconButton";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";
import { CREAR_INSPECCION } from "../api/inspections";

const TYPES = ["Entrada", "Salida"] as const;

interface Props {
	workOrderId: number;
	inspections: { vehicleInspectionId: number; inspectionType: string }[];
	canCreate: boolean;
}

/** Una fila por tipo (Entrada/Salida): abre la existente o la crea con un toque. */
export default function InspectionsSection({ workOrderId, inspections, canCreate }: Props) {
	const intl = useIntl();
	const [create, creating] = useApiMutation(CREAR_INSPECCION, { refetchQueries: ["GetWorkOrder"] });
	return (
		<section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
			<h2 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
				{intl.formatMessage({ id: "inspection.title", defaultMessage: "Inspecciones" })}
			</h2>
			<ul className="flex flex-col gap-2">
				{TYPES.map((t) => {
					const found = inspections.find((i) => i.inspectionType === t);
					const label = intl.formatMessage({ id: `inspection.type.${t}`, defaultMessage: t });
					return (
						<li key={t} className="flex items-center justify-between">
							<span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
							{found ? (
								<Link
									to={`/ordenes/${workOrderId}/inspecciones/${found.vehicleInspectionId}`}
									aria-label={label}
									title={label}
									className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-brand-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
								>
									<ChevronRightIcon className="size-5" />
								</Link>
							) : (
								canCreate && (
									<IconButton
										variant="outline"
										disabled={creating}
										icon={<PlusIcon className="size-5" />}
										label={intl.formatMessage({ id: "inspection.create", defaultMessage: "Crear inspección" })}
										onClick={() => create({ workOrderId, inspectionType: t })}
									/>
								)
							)}
						</li>
					);
				})}
			</ul>
		</section>
	);
}
