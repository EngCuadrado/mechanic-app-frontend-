import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

// Local imports
import { ServerDataTable } from "../table/ServerDataTable";
import { GET_COMPANIES_QUERY } from "../table/QuerysDefinitions";
import { useCompanyColumns } from "../table/ColumnsDefinitions";
import SimpleModal from "../utils/SimpleModal";
import AddNewCompany from "../table/CustomDrawers/AddNewCompany";

const AddNewCompanyModal = ({ onClose }: { onClose: () => void }) => {
	const intl = useIntl();

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "company.add", defaultMessage: "Agregar Empresa" })}
			widthClass="w-full max-w-lg md:max-w-2xl lg:max-w-3xl"
			disableOutsideClick={true}
		>
			<AddNewCompany onClose={onClose} />
		</SimpleModal>
	);
};

export default function Companies() {
	const [showModal, setShowModal] = useState<boolean>(false);
	const query = GET_COMPANIES_QUERY();
	const columns = useCompanyColumns();

	return (
		<div className="flex-1">
			<div className="flex justify-end mb-4">
				<button
					onClick={() => setShowModal(true)}
					className="px-4 py-2 text-white rounded-xl transition-colors flex items-center gap-2 bg-brand-500 hover:bg-brand-600 cursor-pointer shadow-sm shadow-brand-500/20"
				>
					<PlusCircleIcon className="h-5 w-5" />
					<FormattedMessage id="company.add" defaultMessage="Agregar Empresa" />
				</button>
			</div>

			<ServerDataTable 
                query={query}
                queryKeyName="companies"
                columns={columns}
            />

			{showModal && (
				<AddNewCompanyModal onClose={() => setShowModal(false)} />
			)}
		</div>
	);
}

