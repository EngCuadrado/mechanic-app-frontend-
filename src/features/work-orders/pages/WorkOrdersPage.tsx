import { useState } from "react";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { PlusIcon, Squares2X2Icon, ClockIcon } from "@heroicons/react/24/outline";
import IconButton from "../../../shared/components/IconButton";
import Tabs from "../../../shared/components/Tabs";
import OrdersHistory from "../components/OrdersHistory";
import StatusBoard from "../components/StatusBoard";

export default function WorkOrdersPage() {
	const intl = useIntl();
	const [view, setView] = useState("board");
	// Estado con el que abre el historial (el contador "Entregadas hoy" lo abre en Entregado).
	const [historyStatus, setHistoryStatus] = useState<string | null>(null);
	const navigate = useNavigate();

	return (
		<div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 pb-24">
			<div className="flex items-center justify-between gap-3">
				<h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
					{intl.formatMessage({ id: "workOrder.title", defaultMessage: "Órdenes de trabajo" })}
				</h1>
				<IconButton
					variant="primary"
					showLabel
					icon={<PlusIcon className="size-5" />}
					label={intl.formatMessage({ id: "workOrder.reception.title", defaultMessage: "Recibir vehículo" })}
					onClick={() => navigate("/ordenes/recibir")}
				/>
			</div>
			<Tabs
				value={view}
				onChange={(v) => {
					setHistoryStatus(null);
					setView(v);
				}}
				tabs={[
					{ id: "board", label: intl.formatMessage({ id: "workOrder.board", defaultMessage: "Tablero" }), icon: <Squares2X2Icon /> },
					{ id: "history", label: intl.formatMessage({ id: "workOrder.history", defaultMessage: "Historial" }), icon: <ClockIcon /> },
				]}
			/>
			{view === "board" ? (
				<StatusBoard
					onShowDelivered={() => {
						setHistoryStatus("Entregado");
						setView("history");
					}}
				/>
			) : (
				<OrdersHistory initialStatus={historyStatus} />
			)}
		</div>
	);
}
