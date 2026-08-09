import { ServerDataTable } from "../../ui/table/ServerDataTable";
import { useBatchColumns } from "../../ui/table/ColumnsDefinitions";
import { GET_BATHCES_BY_PRODUCT_QUERY } from "../../ui/table/QuerysDefinitions";

interface BatchTableProps {
	productId: number;
}

export default function BatchTable({ productId }: BatchTableProps) {
	const query = GET_BATHCES_BY_PRODUCT_QUERY();
	const columns = useBatchColumns();

	// Filtramos por product_id
	const filter = {
		product_id: { eq: productId },
	};

	return (
		<ServerDataTable
			columns={columns}
			query={query}
			queryKeyName="batches"
			filter={filter}
		/>
	);
}
