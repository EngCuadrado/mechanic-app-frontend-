import { PlusCircleIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

// Local imports
import { useIntl } from "react-intl";
import SimpleModal from "../utils/SimpleModal";
import AddNewMechanic from "../table/CustomDrawers/AddNewMechanic";
import ManageSpecialties from "../table/CustomDrawers/ManageSpecialties";
import { ServerDataTable } from "../table/ServerDataTable";
import { GET_MECHANICS_QUERY } from "../table/QuerysDefinitions";
import { useMechanicColumns } from "../table/ColumnsDefinitions";

const AddNewMechanicModal = ({ onClose }: any) => {
	const intl = useIntl();

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "mechanic.add", defaultMessage: "Agregar Mecánico" })}
			widthClass="w-full max-w-lg md:max-w-2xl"
			disableOutsideClick={true}
		>
			<div>
				<AddNewMechanic onClose={onClose} />
			</div>
		</SimpleModal>
	);
};

export default function Mechanics() {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [showSpecialties, setShowSpecialties] = useState<boolean>(false);
	const intl = useIntl();
    const query = GET_MECHANICS_QUERY();
    const columns = useMechanicColumns();

	return (
		<div className="flex-1">
			<div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-3 mb-4">
				<button
					onClick={() => setShowSpecialties(true)}
					className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center gap-2 cursor-pointer"
				>
					<WrenchScrewdriverIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
					<FormattedMessage id="specialties.manage" defaultMessage="Gestionar Especialidades" />
				</button>
				<button
					onClick={() => setShowModal(true)}
					className="px-4 py-2 text-white rounded-xl transition-colors flex items-center gap-2 bg-brand-500 hover:bg-brand-600 cursor-pointer shadow-sm shadow-brand-500/20"
				>
					<PlusCircleIcon className="h-5 w-5" />
					<FormattedMessage id="mechanic.add" defaultMessage="Agregar Mecánico" />
				</button>
			</div>

			<ServerDataTable 
                query={query}
                queryKeyName="mechanics"
                columns={columns}
            />

			{showModal && (
				<AddNewMechanicModal onClose={() => setShowModal(false)} />
			)}

			{showSpecialties && (
				<ManageSpecialties onClose={() => setShowSpecialties(false)} />
			)}
		</div>
	);
}
