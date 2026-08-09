// src/components/features/employee/EmployeeTable.tsx
import { ServerDataTable } from "../../ui/table/ServerDataTable";
import { useCategoryColumns } from "../../ui/table/ColumnsDefinitions";
import { GET_CATEGORIES_QUERY } from "../../ui/table/QuerysDefinitions";

export default function CategoriesTable() {
	const query = GET_CATEGORIES_QUERY();
	const columns = useCategoryColumns();

	return (
		<ServerDataTable
			columns={columns}
			query={query}
			queryKeyName="categories"
		/>
	);
}
