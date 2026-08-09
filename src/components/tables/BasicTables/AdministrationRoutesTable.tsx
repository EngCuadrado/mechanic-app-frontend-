// src/components/features/employee/EmployeeTable.tsx
import { ServerDataTable } from "../../ui/table/ServerDataTable";
import { useAdministrationRoutesColumns } from "../../ui/table/ColumnsDefinitions";
import { GET_ADMINISTRATION_ROUTES_QUERY } from "../../ui/table/QuerysDefinitions";

export default function AdministrationRoutesTable() {
	const query = GET_ADMINISTRATION_ROUTES_QUERY();
	const columns = useAdministrationRoutesColumns();

	return (
		<ServerDataTable
			columns={columns}
			query={query}
			queryKeyName="administrationRoutes"
		/>
	);
}
