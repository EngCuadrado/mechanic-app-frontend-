import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { PlusCircleIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import SimpleModal from "../utils/SimpleModal";
import MedicineTable from "../../tables/BasicTables/MedicineTable";
import AddNewMedicine from "../table/CustomDrawers/AddNewMedicine";
import { useAuth } from "../../../context/AuthContext";
import MedicineExportButton from "./MedicineExportButton";

const AddNewBrandDrawer = ({ onClose }: any) => {
	const intl = useIntl();

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "brand_add" })}
			widthClass="w-[75%] h-[75%]"
			custom="h-200"
			disableOutsideClick={true}
		>
			<div>
				<AddNewMedicine onClose={onClose} />
			</div>
		</SimpleModal>
	);
};

export default function Medicines() {
	const [showDrawer, setShowDrawer] = useState<boolean>(false);
	const { user } = useAuth();

	const startTour = () => {
		const driverObj = driver({
			showProgress: true,
			nextBtnText: "Siguiente",
			prevBtnText: "Anterior",
			doneBtnText: "Finalizar",
			steps: [
				{
					element: "#tour-actions",
					popover: {
						title: "Acciones rápidas",
						description: "Desde aquí puedes exportar tu catálogo actual o registrar nuevos medicamentos en el sistema.",
						side: "bottom",
						align: "end",
					},
				},
				{
					element: "#tour-med-search",
					popover: {
						title: "Buscador de Medicamentos",
						description: "Busca medicamentos directamente escribiendo su nombre o código aquí.",
						side: "bottom",
						align: "start",
					},
				},
				{
					element: "#tour-med-category",
					popover: {
						title: "Filtrar por Categoría",
						description: "Filtra el catálogo por su categoría terapéutica.",
						side: "bottom",
						align: "start",
					},
				},
				{
					element: "#tour-med-route",
					popover: {
						title: "Filtrar por Vía de Administración",
						description: "Encuentra medicamentos según su vía de administración (oral, tópica, intravenosa, etc.).",
						side: "bottom",
						align: "start",
					},
				},
				{
					element: "#tour-med-ingredient",
					popover: {
						title: "Filtrar por Principio Activo",
						description: "Muy útil para encontrar equivalentes o genéricos filtrando por el compuesto principal.",
						side: "bottom",
						align: "start",
					},
				},
				{
					element: "#tour-med-table",
					popover: {
						title: "Listado de Resultados",
						description: "Aquí verás los resultados. Si aplicas filtros, aparecerá un botón rojo arriba para limpiarlos rápidamente.",
						side: "top",
						align: "start",
					},
				},
			],
		});

		driverObj.drive();
	};

	return (
		<div className="flex-1">
			{user?.roleId !== 2 && (
				<div id="tour-actions" className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 mb-4">
					<button
						onClick={startTour}
						className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center gap-2 cursor-pointer"
					>
						<QuestionMarkCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						Guía rápida
					</button>
					<MedicineExportButton />    
					<button
						onClick={() => setShowDrawer(true)}
						className="px-4 py-2 text-white rounded-xl transition-colors flex items-center gap-2 bg-brand-500 cursor-pointer"
					>
						<PlusCircleIcon className="h-5 w-5" />
						<FormattedMessage id="medicine.add" />
					</button>
				</div>
			)}

			<MedicineTable />

			{showDrawer && (
				<AddNewBrandDrawer onClose={() => setShowDrawer(false)} />
			)}
		</div>
	);
}

