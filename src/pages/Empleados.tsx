import { useState } from "react";
import { useIntl } from "react-intl";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

// Local imports
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import CellWithDrawer from "../components/ui/table/CellWithDrawer";
import EmployeeTable from "../components/tables/BasicTables/EmployeeTable";
import AddEmployeeForm from "../components/ui/table/CustomCells/AddEmployee";

const AddEmployeeDrawer = ({ onClose }: { onClose: () => void }) => {
	const intl = useIntl();

	return (
		<CellWithDrawer
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "employee.add" })}
			widthClass="w-150"
		>
			<AddEmployeeForm
				onClose={onClose}
				onSaveSuccess={() => {
					// Aquí podrías forzar una recarga si fuera necesario,
					// pero el ServerDataTable usualmente maneja su propio estado.
					onClose();
				}}
			/>
		</CellWithDrawer>
	);
};

export default function Empleados() {
	const [showDrawer, setShowDrawer] = useState<boolean>(false);
	const intl = useIntl();

	return (
		<div>
			<PageBreadcrumb
				pageTitle={intl.formatMessage({ id: "employees" })}
			/>

			<div className="flex-1">
				<div className="flex justify-end mb-4">
					<button
						onClick={() => setShowDrawer(true)}
						className="px-4 py-2 text-white rounded-xl transition-colors flex items-center gap-2 bg-brand-500 hover:bg-brand-600"
					>
						<PlusCircleIcon className="h-5 w-5" />
						{intl.formatMessage({ id: "employee.add" })}
					</button>
				</div>

				<div>
					<EmployeeTable />
				</div>

				{showDrawer && (
					<AddEmployeeDrawer onClose={() => setShowDrawer(false)} />
				)}
			</div>
		</div>
	);
}
