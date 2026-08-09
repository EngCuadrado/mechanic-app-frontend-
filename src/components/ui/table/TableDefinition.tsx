// --- Imports de Librerías ---
import {
	ChevronDownIcon,
	ChevronUpIcon,
	ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import {
	flexRender, // Función de TanStack para renderizar contenido (headers, celdas)
	Table as TanStackTable, // Importa el TIPO de la instancia de la tabla
} from "@tanstack/react-table";
import { useIntl } from "react-intl"; // Hook para traducciones

// --- Imports Locales ---
// Componentes visuales (de tu plantilla)
import { Table, TableBody, TableCell, TableHeader, TableRow } from ".";
// Componente personalizado para la paginación
import PaginationControl from "./PaginationControl";

// Define las props que espera este componente.
interface TableDefinitionProps<T> {
	// Recibe la instancia completa de la tabla ('table') creada con `useReactTable`.
	table: TanStackTable<T>;
}

/**
 * Componente "tonto" (Dumb Component) que solo renderiza la UI de la tabla.
 * Recibe la instancia 'table' (el "cerebro") y la dibuja.
 * No maneja estado, solo obedece a la instancia 'table'.
 */
export default function TableDefinition<T>({ table }: TableDefinitionProps<T>) {
	// Hook para obtener las traducciones
	const intl = useIntl();

	return (
		// Contenedor principal para el filtro, la tabla y la paginación
		<div className="flex flex-col gap-5">
			{/* --- Filtro Global (Búsqueda) --- */}
			<div>
				<input
					type="text"
					// Conecta el valor del input al estado `globalFilter` de la tabla
					value={table.getState().globalFilter ?? ""}
					// Actualiza el estado `globalFilter` de la tabla en cada cambio
					onChange={(e) => table.setGlobalFilter(e.target.value)}
					// Placeholder traducido
					placeholder={intl.formatMessage({ id: "search" }) + "..."}
					// Estilos de Tailwind para el input
					className="w-full max-w-sm p-2 border border-gray-300 rounded-md dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white"
				/>
			</div>

			{/* --- Contenedor de la Tabla (con scroll) --- */}
			<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
				<div className="max-w-full overflow-x-auto">
					<Table>
						{/* === ENCABEZADO (renderizado por TanStack) === */}
						<TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
							{/* `getHeaderGroups` genera las filas del encabezado (usualmente una) */}
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{/* Itera sobre cada columna/celda del encabezado */}
									{headerGroup.headers.map((header) => (
										<TableCell
											key={header.id}
											isHeader
											className="px-5 py-3 text-start text-gray-500 font-medium text-theme-lg"
										>
											{/* Div interno para manejar el clic de ordenamiento */}
											<div
												style={{
													// Cursor de puntero si la columna se puede ordenar
													cursor: header.column.getCanSort()
														? "pointer"
														: "default",
													// Evita seleccionar el texto al hacer clic
													userSelect: "none",
												}}
												// Handler de TanStack que activa/desactiva el ordenamiento
												onClick={header.column.getToggleSortingHandler()}
												className="flex items-center gap-1"
											>
												{/* `flexRender` dibuja el contenido del header (ej: el string 'Nombres') */}
												{flexRender(
													header.column.columnDef
														.header,
													header.getContext(),
												)}

												{/* --- Indicador visual de Ordenamiento --- */}
												<span>
													{/* Muestra un ícono diferente según el estado de orden (asc, desc, false) */}
													{{
														asc: (
															<ChevronUpIcon className="w-4 h-4 text-gray-400" />
														),
														desc: (
															<ChevronDownIcon className="w-4 h-4 text-gray-400" />
														),
														false: (
															<ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
														),
													}[
														header.column.getIsSorted() as string
													] ?? null}
												</span>
											</div>
										</TableCell>
									))}
								</TableRow>
							))}
						</TableHeader>

						{/* === CUERPO (renderizado por TanStack) === */}
						<TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
							{/* `getRowModel().rows` contiene las filas de la página actual, ya filtradas y ordenadas */}
							{table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{/* Itera sobre cada celda visible de la fila */}
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className="px-5 py-3 text-start text-gray-800 dark:text-white"
										>
											{/* `flexRender` dibuja el contenido de la celda (ej: el componente Badge o un string) */}
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* --- Controles de Paginación --- */}
			{/* Componente dedicado que recibe la instancia 'table' para manejar la lógica de paginación */}
			<PaginationControl table={table} />
		</div>
	);
}
