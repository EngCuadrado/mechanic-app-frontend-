// src/components/features/employee/EmployeeTable.tsx
import { ServerDataTable } from "../../ui/table/ServerDataTable";
import { useSupplierTypesColumns } from "../../ui/table/ColumnsDefinitions";
import { GET_SUPPLIER_TYPES_QUERY } from "../../ui/table/QuerysDefinitions";

export default function SupplierTypeTable() {
	const query = GET_SUPPLIER_TYPES_QUERY();
	const columns = useSupplierTypesColumns();

	return (
		<ServerDataTable
			columns={columns}
			query={query}
			queryKeyName="supplierTypes"
		/>
	);
}
