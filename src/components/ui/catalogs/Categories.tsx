import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

// Local imports
import CategoriesTable from "../../tables/BasicTables/CategoriesTable";
import { useIntl } from "react-intl";
import CellWithDrawer from "../table/CellWithDrawer";
import AddNewCategory from "../table/CustomDrawers/AddNewCategory";

const AddNewCategoryDrawer = ({ onClose }: { onClose: () => void }) => {
	const intl = useIntl();

	return (
		<CellWithDrawer
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "category.add" })}
			widthClass="w-150"
		>
			<AddNewCategory onClose={onClose} />
		</CellWithDrawer>
	);
};

export default function Categories() {
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
					{intl.formatMessage({ id: "category.add" })}
				</button>
			</div>

			<CategoriesTable />

			{showDrawer && (
				<AddNewCategoryDrawer onClose={() => setShowDrawer(false)} />
			)}
		</div>
	);
}
