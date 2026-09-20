import { PlusCircleIcon, TagIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { useIntl } from "react-intl";
import SimpleModal from "../utils/SimpleModal";
import AddNewVehicleModel from "../table/CustomDrawers/AddNewVehicleModel";
import ManageVehicleBrands from "../table/CustomDrawers/ManageVehicleBrands";
import { ServerDataTable } from "../table/ServerDataTable";
import { GET_VEHICLE_MODELS_QUERY } from "../table/QuerysDefinitions";
import { useVehicleModelColumns } from "../table/ColumnsDefinitions";

const AddNewVehicleModelModal = ({ onClose }: any) => {
	const intl = useIntl();

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "model.add", defaultMessage: "Agregar Modelo" })}
			widthClass="w-full max-w-lg md:max-w-2xl"
			disableOutsideClick={true}
		>
			<div>
				<AddNewVehicleModel onClose={onClose} />
			</div>
		</SimpleModal>
	);
};

export default function VehicleModels() {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [showBrands, setShowBrands] = useState<boolean>(false);
	const intl = useIntl();
    const query = GET_VEHICLE_MODELS_QUERY();
    const columns = useVehicleModelColumns();

	return (
		<div className="flex-1">
			<div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-3 mb-4">
				<button
					onClick={() => setShowBrands(true)}
					className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center gap-2 cursor-pointer"
				>
					<TagIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
					<FormattedMessage id="brands.manage" defaultMessage="Gestionar Marcas" />
				</button>
				<button
					onClick={() => setShowModal(true)}
					className="px-4 py-2 text-white rounded-xl transition-colors flex items-center gap-2 bg-brand-500 hover:bg-brand-600 cursor-pointer shadow-sm shadow-brand-500/20"
				>
					<PlusCircleIcon className="h-5 w-5" />
					<FormattedMessage id="model.add" defaultMessage="Agregar Modelo" />
				</button>
			</div>

			<ServerDataTable 
                query={query}
                queryKeyName="vehicleModels"
                columns={columns}
            />

			{showModal && (
				<AddNewVehicleModelModal onClose={() => setShowModal(false)} />
			)}

			{showBrands && (
				<ManageVehicleBrands onClose={() => setShowBrands(false)} />
			)}
		</div>
	);
}
