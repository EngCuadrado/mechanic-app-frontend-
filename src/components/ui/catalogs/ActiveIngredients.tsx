import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

// Local imports
import { useIntl } from "react-intl";
import CellWithDrawer from "../table/CellWithDrawer";
import AddNewActiveIngredient from "../table/CustomDrawers/AddNewActiveIngredient";
import ActiveIngredientsTable from "../../tables/BasicTables/ActiveIngredientsTable";

const AddNewActiveIngredientDrawer = ({ onClose }: { onClose: () => void }) => {
	const intl = useIntl();

	return (
		<CellWithDrawer
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "active_ingredient.add" })}
			widthClass="w-150"
		>
			<AddNewActiveIngredient onClose={onClose} />
		</CellWithDrawer>
	);
};

export default function ActiveIngredients() {
	const [showDrawer, setShowDrawer] = useState<boolean>(false);
	const intl = useIntl();

	return (
		<div className="flex-1">
			<div className="flex justify-end mb-4">
				<button
					onClick={() => setShowDrawer(true)}
					className="px-4 py-2 text-white rounded-xl transition-colors flex items-center gap-2 bg-brand-500"
				>
					<PlusCircleIcon className="h-5 w-5" />
					{intl.formatMessage({ id: "active_ingredient.add" })}
				</button>
			</div>

			<ActiveIngredientsTable />

			{showDrawer && (
				<AddNewActiveIngredientDrawer onClose={() => setShowDrawer(false)} />
			)}
		</div>
	);
}
