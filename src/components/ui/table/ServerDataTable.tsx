// src/components/ui/table/ServerDataTable.tsx
import { useState, useEffect } from "react";
import {
	useReactTable,
	getCoreRowModel,
	ColumnDef,
	flexRender,
	SortingState,
} from "@tanstack/react-table";
import { useQuery } from "@apollo/client/react"; // Cambiamos fetch por useQuery
import {
	ChevronDownIcon,
	ChevronUpIcon,
	ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { Table, TableBody, TableCell, TableHeader, TableRow } from ".";
import { useGraphQLPagination } from "../../../hooks/useGraphQLPagination";
import CursorPaginationControl from "./CursorPaginationControl";
import Loading from "../loading/Loading";

interface ServerDataTableProps<TData> {
	columns: ColumnDef<TData, any>[];
	query: any; // Ahora es un DocumentNode (gql)
	queryKeyName: string;
	initialPageSize?: number;
	filter?: any;
}

interface ApolloResponse {
	[key: string]: {
		nodes: any[];
		pageInfo: {
			hasNextPage: boolean;
			endCursor: string | null;
		};
	};
}

export function ServerDataTable<TData>({
	columns,
	query,
	queryKeyName,
	initialPageSize = 10,
	filter,
}: ServerDataTableProps<TData>) {
	// 1. Estados de la Tabla (TanStack)
	const [sorting, setSorting] = useState<SortingState>([]);

	// 2. Hook de Paginación Personalizado
	const {
		pageSize,
		setPageSize,
		currentCursor,
		onNextPage,
		onPreviousPage,
		hasPreviousPage,
		resetPagination,
	} = useGraphQLPagination(initialPageSize);

	// Reset pagination when filter changes
	useEffect(() => {
		resetPagination();
	}, [filter, resetPagination]);

	// 3. Formatear variables para GraphQL
	const order =
		sorting.length > 0
			? { [sorting[0].id]: sorting[0].desc ? "DESC" : "ASC" }
			: null;

	// 4. Hook useQuery de Apollo
	// Se dispara automáticamente cuando cambian variables (pagination o sorting)
	const {
		data: apolloData,
		loading,
		error,
	} = useQuery<ApolloResponse>(query, {
		variables: {
			first: pageSize,
			after: currentCursor,
			order: order,
			where: filter,
		},
		fetchPolicy: "cache-and-network", // Muestra caché primero, luego actualiza
		notifyOnNetworkStatusChange: true, // Para que 'loading' sea true en cada refetch
	});

	// 5. Extraer Nodos y PageInfo de la respuesta
	const nodes = apolloData?.[queryKeyName]?.nodes || [];
	const pageInfo = apolloData?.[queryKeyName]?.pageInfo || {
		hasNextPage: false,
		endCursor: null,
	};

	// 6. Configuración de TanStack Table
	const table = useReactTable({
		data: nodes,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		manualSorting: true,
	});

	if (error)
		return (
			<div className="text-red-500 p-4 font-bold">
				Error: {error.message}
			</div>
		);

	return (
		<div className="flex flex-col gap-4">
			<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
				<div className="max-w-full overflow-x-auto min-h-60">
					<Table>
						<TableHeader className="border-b border-gray-100">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableCell
											key={header.id}
											isHeader
											className="px-5 py-3 text-start font-medium text-gray-500 dark:text-white"
										>
											<div
												className={
													header.column.getCanSort()
														? "cursor-pointer select-none flex items-center gap-1"
														: ""
												}
												onClick={header.column.getToggleSortingHandler()}
											>
												{flexRender(
													header.column.columnDef
														.header,
													header.getContext(),
												)}
												<span>
													{{
														asc: (
															<ChevronUpIcon className="w-4 h-4 text-primary-600" />
														),
														desc: (
															<ChevronDownIcon className="w-4 h-4 text-primary-600" />
														),
													}[
														header.column.getIsSorted() as string
													] ??
														(header.column.getCanSort() ? (
															<ChevronUpDownIcon className="w-4 h-4 text-gray-300" />
														) : null)}
												</span>
											</div>
										</TableCell>
									))}
								</TableRow>
							))}
						</TableHeader>

						<TableBody
							className={
								loading
									? "opacity-50 pointer-events-none transition-opacity"
									: ""
							}
						>
							{nodes.length > 0 ? (
								table.getRowModel().rows.map((row) => (
									<TableRow key={row.id}>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												key={cell.id}
												className="px-5 py-3 text-gray-800 dark:text-white"
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<td
										colSpan={columns.length}
										className="py-10 px-5 dark:text-gray-400"
									>
										<div className="flex justify-center items-center w-full h-full min-h-[150px]">
											{loading ? (
												<Loading size="lg" />
											) : (
												"No se encontraron resultados"
											)}
										</div>
									</td>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<CursorPaginationControl
				hasNextPage={pageInfo.hasNextPage}
				hasPreviousPage={hasPreviousPage}
				onNext={() =>
					pageInfo.endCursor && onNextPage(pageInfo.endCursor)
				}
				onPrevious={onPreviousPage}
				loading={loading}
				pageSize={pageSize}
				setPageSize={(newSize) => {
					setPageSize(newSize);
					resetPagination();
				}}
			/>
		</div>
	);
}
