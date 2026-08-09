// src/components/features/employee/EmployeeTable.tsx
import { ServerDataTable } from "../../ui/table/ServerDataTable";
import { useSupplierColumns } from "../../ui/table/ColumnsDefinitions";
import { GET_SUPPLIER_QUERY } from "../../ui/table/QuerysDefinitions";

export default function SupplierTable() {
	const query = GET_SUPPLIER_QUERY();
	const columns = useSupplierColumns();

	return (
		<ServerDataTable
			columns={columns}
			query={query}
			queryKeyName="suppliers"
		/>
	);
}
