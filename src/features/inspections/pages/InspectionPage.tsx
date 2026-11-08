import { Link, useParams } from "react-router";
import { useIntl } from "react-intl";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@apollo/client/react";
import { GET_ORDER_STATUS } from "../api/inspections";
import InspectionFormView from "../components/InspectionFormView";

export default function InspectionPage() {
	const intl = useIntl();
	const { id, inspectionId } = useParams();
	const { data } = useQuery<{ workOrder: { currentStatus: string } | null }>(GET_ORDER_STATUS, { variables: { id: Number(id) } });
	const status = data?.workOrder?.currentStatus;
	const back = intl.formatMessage({ id: "common.back", defaultMessage: "Volver" });
	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
			<div className="flex items-center gap-3">
				<Link
					to={`/ordenes/${id}`}
					aria-label={back}
					title={back}
					className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
				>
					<ArrowLeftIcon className="size-5" />
				</Link>
				<h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
					{intl.formatMessage({ id: "inspection.title", defaultMessage: "Inspecciones" })} · #{id}
				</h1>
			</div>
			<InspectionFormView
				inspectionId={Number(inspectionId)}
				readOnly={status ? ["Entregado", "Cancelado"].includes(status) : true}
			/>
		</div>
	);
}
