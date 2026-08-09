// src/components/features/employee/EmployeeTable.tsx
import { ServerDataTable } from "../../ui/table/ServerDataTable";
import { useActiveIngredientsColumns } from "../../ui/table/ColumnsDefinitions";
import { GET_ACTIVE_INGREDIENTES_QUERY } from "../../ui/table/QuerysDefinitions";

export default function ActiveIngredientsTable() {
	const query = GET_ACTIVE_INGREDIENTES_QUERY();
	const columns = useActiveIngredientsColumns();

	return (
		<ServerDataTable
			columns={columns}
			query={query}
			queryKeyName="activeIngredients"
		/>
	);
}
