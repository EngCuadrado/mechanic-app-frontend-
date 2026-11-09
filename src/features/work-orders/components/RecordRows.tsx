import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { useIntl } from "react-intl";
import { CameraIcon, ChevronRightIcon, ClipboardDocumentCheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import BottomSheet from "../../../shared/components/BottomSheet";
import { PhotosSection } from "../../photos";
import { isClosed, STATUS_PHOTO_STAGE } from "../constants";
import type { WorkOrderDetail } from "../types";

const ROW = "flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 text-left hover:bg-gray-50 dark:hover:bg-white/[0.03] [&>svg:first-child]:size-5 [&>svg:first-child]:text-gray-500";

function Row({ icon, label, children }: { icon: ReactNode; label: string; children?: ReactNode }) {
	return (
		<>
			{icon}
			<span className="flex-1 text-sm font-medium text-gray-800 dark:text-white/90">{label}</span>
			{children}
			<ChevronRightIcon className="size-5 text-gray-400" />
		</>
	);
}

/** Registro de la orden en filas: inspecciones, fotos y firmas. Lo que se captura ya vive en recibir/entregar. */
export default function RecordRows({ order }: { order: WorkOrderDetail }) {
	const intl = useIntl();
	const [sheet, setSheet] = useState<"photos" | "signatures" | null>(null);
	const closed = isClosed(order.currentStatus);
	const t = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage });
	const icon = (I: typeof CameraIcon) => <I />;

	return (
		<section className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
			<h2 className="px-4 pt-4 pb-2 font-semibold text-gray-800 dark:text-white/90">{t("workOrder.records", "Registro")}</h2>
			<ul className="divide-y divide-gray-100 dark:divide-gray-800">
				{(["Entrada", "Salida"] as const).map((type) => {
					const found = order.inspections.find((i) => i.inspectionType === type);
					const label = t(`workOrder.record.${type === "Entrada" ? "entry" : "exit"}`, `Inspección de ${type.toLowerCase()}`);
					return (
						<li key={type}>
							{found ? (
								<Link to={`/ordenes/${order.workOrderId}/inspecciones/${found.vehicleInspectionId}`} className={ROW}>
									<Row icon={icon(ClipboardDocumentCheckIcon)} label={label} />
								</Link>
							) : (
								<div className={`${ROW} cursor-default text-gray-400 hover:bg-transparent`}>
									{icon(ClipboardDocumentCheckIcon)}
									<span className="flex-1 text-sm">{label}</span>
									<span className="text-xs">{t("workOrder.record.none", "Aún no hay")}</span>
								</div>
							)}
						</li>
					);
				})}
				<li>
					<button type="button" className={ROW} onClick={() => setSheet("photos")}>
						<Row icon={icon(CameraIcon)} label={t("workOrder.record.photos", "Fotos")} />
					</button>
				</li>
				<li>
					<button type="button" className={ROW} onClick={() => setSheet("signatures")}>
						<Row icon={icon(PencilSquareIcon)} label={t("workOrder.record.signatures", "Firmas")} />
					</button>
				</li>
			</ul>
			<BottomSheet isOpen={sheet === "photos"} onClose={() => setSheet(null)} title={t("workOrder.record.photos", "Fotos")}>
				<PhotosSection
					workOrderId={order.workOrderId}
					canAdd={!closed}
					canDelete={order.currentStatus !== "Entregado"}
					initialStage={STATUS_PHOTO_STAGE[order.currentStatus]}
				/>
			</BottomSheet>
			<BottomSheet isOpen={sheet === "signatures"} onClose={() => setSheet(null)} title={t("workOrder.record.signatures", "Firmas")}>
				<div className="flex flex-col gap-4">
					{[
						[t("workOrder.record.dropoff", "Quien lo trajo"), order.dropoffDriverName, order.dropoffSignatureUrl],
						[t("workOrder.record.pickup", "Quien lo recoge"), order.pickupDriverName, order.pickupSignatureUrl],
					].map(([label, name, url]) => (
						<div key={label} className="flex flex-col gap-2">
							<p className="text-sm font-semibold text-gray-800 dark:text-white/90">{label}{name ? `: ${name}` : ""}</p>
							{url ? (
								<img src={url} alt={label ?? ""} className="h-28 w-full rounded-xl border border-gray-200 bg-white object-contain dark:border-gray-700" />
							) : (
								<div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-700">
									{t("workOrder.record.noSignature", "Sin firma")}
								</div>
							)}
						</div>
					))}
				</div>
			</BottomSheet>
		</section>
	);
}
