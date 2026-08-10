import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

// Local imports
import { useIntl } from "react-intl";
import CellWithDrawer from "../table/CellWithDrawer";
import AddNewBrand from "../table/CustomDrawers/AddNewBrand";
import { ServerDataTable } from "../table/ServerDataTable";
import { GET_MECHANICS_QUERY } from "../table/QuerysDefinitions";
import { useMechanicColumns } from "../table/ColumnsDefinitions";

const AddNewBrandDrawer = ({ onClose }: any) => {
	const intl = useIntl();

	return (
		<CellWithDrawer
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "brand.add" })}
			widthClass="w-150"
		>
			<div>
				<AddNewBrand />
			</div>
		</CellWithDrawer>
	);
};

export default function Mechanics() {
	const [showDrawer, setShowDrawer] = useState<boolean>(false);
	const intl = useIntl();
    const query = GET_MECHANICS_QUERY();
    const columns = useMechanicColumns();

	return (
		<div className="flex-1">
			{/* 1. Envolvemos el botón en un div con 'flex' y 'justify-end' */}
			<div className="flex justify-end mb-4">
				<button
					onClick={() => setShowDrawer(true)}
					className="px-4 py-2 text-white rounded-xl transition-colors flex items-center gap-2 bg-brand-500"
				>
					<PlusCircleIcon className="h-5 w-5" />
					{intl.formatMessage({ id: "brand.add" })}
				</button>
			</div>

			<ServerDataTable 
                query={query}
                queryKeyName="mechanics"
                columns={columns}
            />

			{showDrawer && (
				<AddNewBrandDrawer onClose={() => setShowDrawer(false)} />
			)}
		</div>
	);
}
