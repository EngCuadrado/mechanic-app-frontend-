import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import { useIntl } from "react-intl";
import {
	ArrowLeftIcon,
	CameraIcon,
	ClipboardDocumentCheckIcon,
	CubeIcon,
	PencilSquareIcon,
	WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import Loading from "../../../components/ui/loading/Loading";
import EmptyState from "../../../shared/components/EmptyState";
import Tabs, { type TabItem } from "../../../shared/components/Tabs";
import { formatMoney } from "../../../shared/utils/format";
import { InspectionsSection } from "../../inspections";
import { PhotosSection } from "../../photos";
import HandoverSection from "../components/HandoverSection";
import PartsSection from "../components/PartsSection";
import ServicesSection from "../components/ServicesSection";
import StatusActions from "../components/StatusActions";
import StatusBadge from "../components/StatusBadge";
import StatusGuide from "../components/StatusGuide";
import StatusProgress from "../components/StatusProgress";
import WorkOrderSummary from "../components/WorkOrderSummary";
import { isClosed, STATUS_PHOTO_STAGE, STATUS_SECTIONS, type SectionId } from "../constants";
import type { WorkOrderDetail } from "../types";
import { useOrderTasks, type TaskTarget } from "../hooks/useOrderTasks";
import { useWorkOrder } from "../hooks/useWorkOrder";

const EMPTY_ORDER = { workOrderId: 0, currentStatus: "", services: [], inspections: [] } as unknown as WorkOrderDetail;

export default function WorkOrderDetailPage() {
	const intl = useIntl();
	const id = Number(useParams().id);
	const { order, loading, error } = useWorkOrder(id);
	const [tab, setTab] = useState("parts");
	const [showAll, setShowAll] = useState(false);
	const tasks = useOrderTasks(order ?? EMPTY_ORDER);
	const go = (target: TaskTarget) => {
		const el = document.getElementById(`sec-${target}`);
		if (el) return el.scrollIntoView({ behavior: "smooth", block: "start" });
		setTab(target);
		setShowAll(true);
	};

	if (loading && !order) return <Loading />;
	if (error || !order)
		return (
			<EmptyState
				text={intl.formatMessage({
					id: error ? "common.loadError" : "workOrder.notFound",
					defaultMessage: error ? "No se pudo cargar la información" : "Orden no encontrada",
				})}
			/>
		);

	const closed = isClosed(order.currentStatus);
	const cancelled = order.currentStatus === "Cancelado";
	const model = order.vehicle?.model;
	const sections: Record<SectionId, ReactNode> = {
		handover: <HandoverSection key={order.workOrderId} order={order} readOnly={closed} />,
		inspections: <InspectionsSection workOrderId={order.workOrderId} inspections={order.inspections} canCreate={!closed} />,
		photos: (
			<PhotosSection
				key={`${order.workOrderId}-${order.currentStatus}`}
				workOrderId={order.workOrderId}
				canAdd={!closed}
				canDelete={order.currentStatus !== "Entregado"}
				initialStage={STATUS_PHOTO_STAGE[order.currentStatus]}
			/>
		),
		services: <ServicesSection workOrderId={order.workOrderId} services={order.services} canEdit={!closed} />,
		parts: <PartsSection workOrderId={order.workOrderId} parts={order.parts} canAdd={!closed} canEdit={!closed} canRemove={!closed || cancelled} />,
	};
	const focus = showAll ? null : STATUS_SECTIONS[order.currentStatus];
	const tabs: TabItem[] = [
		{ id: "parts", label: intl.formatMessage({ id: "workOrder.parts", defaultMessage: "Repuestos" }), icon: <CubeIcon />, count: order.parts.length },
		{ id: "services", label: intl.formatMessage({ id: "workOrder.services", defaultMessage: "Servicios" }), icon: <WrenchScrewdriverIcon />, count: order.services.length },
		{ id: "inspections", label: intl.formatMessage({ id: "inspection.title", defaultMessage: "Inspecciones" }), icon: <ClipboardDocumentCheckIcon /> },
		{ id: "handover", label: intl.formatMessage({ id: "handover.title", defaultMessage: "Acta de entrega" }), icon: <PencilSquareIcon /> },
		{ id: "photos", label: intl.formatMessage({ id: "photos.title", defaultMessage: "Fotos" }), icon: <CameraIcon /> },
	];

	return (
		<div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 pb-28">
			<header className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
				<div className="flex items-center gap-3">
					<Link
						to="/ordenes"
						aria-label={intl.formatMessage({ id: "common.back", defaultMessage: "Volver" })}
						title={intl.formatMessage({ id: "common.back", defaultMessage: "Volver" })}
						className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
					>
						<ArrowLeftIcon className="size-5" />
					</Link>
					<div className="min-w-0 flex-1">
						<h1 className="truncate text-2xl font-bold tracking-wide text-gray-800 dark:text-white/90">{order.vehicle?.plate}</h1>
						<p className="truncate text-sm text-gray-500 dark:text-gray-400">
							{[model?.brand?.brandName, model?.modelName].filter(Boolean).join(" ")} · #{order.workOrderId}
						</p>
					</div>
					<StatusBadge status={order.currentStatus} />
				</div>
				<StatusProgress status={order.currentStatus} />
			</header>

			<StatusGuide status={order.currentStatus} tasks={tasks} onGo={go} />

			<div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
				<aside className="flex flex-col gap-4">
					<WorkOrderSummary order={order} />
				</aside>
				<div className="flex min-w-0 flex-col gap-4">
					{focus ? (
						<>
							{focus.map((id) => (
								<div key={id} id={`sec-${id}`} className="scroll-mt-4">{sections[id]}</div>
							))}
							<button
								type="button"
								onClick={() => setShowAll(true)}
								className="min-h-12 cursor-pointer rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 dark:border-gray-800 dark:text-gray-300"
							>
								{intl.formatMessage({ id: "workOrder.guide.showAll", defaultMessage: "Ver todo" })}
							</button>
						</>
					) : (
						<>
							<Tabs tabs={tabs} value={tab} onChange={setTab} />
							{sections[tab as SectionId]}
							{!closed && (
								<button
									type="button"
									onClick={() => setShowAll(false)}
									className="min-h-12 cursor-pointer rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 dark:border-gray-800 dark:text-gray-300"
								>
									{intl.formatMessage({ id: "workOrder.guide.showGuide", defaultMessage: "Volver a la guía" })}
								</button>
							)}
						</>
					)}
				</div>
			</div>

			<section className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
				<span className="text-gray-500 dark:text-gray-400">{intl.formatMessage({ id: "workOrder.total", defaultMessage: "Total" })}</span>
				<span className="text-2xl font-bold text-gray-800 dark:text-white/90">{formatMoney(order.totalBilledPrice)}</span>
			</section>

			<StatusActions workOrderId={order.workOrderId} status={order.currentStatus} pending={tasks.filter((t) => !t.done).map((t) => t.labelId)} />
		</div>
	);
}
