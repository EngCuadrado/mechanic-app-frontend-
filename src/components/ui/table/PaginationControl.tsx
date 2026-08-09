// src/components/ui/PaginationControl.tsx

import { Table as TanStackTable } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { FormattedMessage } from "react-intl";

interface PaginationControlProps<T> {
	table: TanStackTable<T>;
}

/**
 * Genera el rango de números de página con '...'
 */
const getPaginationRange = (
	currentPage: number,
	totalPages: number,
	siblingCount: number = 1,
): (string | number)[] => {
	// Rango total de páginas a mostrar (ej: 1, ..., 4, 5, 6, ..., 10)
	const totalPageNumbers = siblingCount + 5; // (siblings + first + last + current + 2x '...')

	// Caso 1: El número total de páginas es menor que el rango que queremos mostrar
	if (totalPages <= totalPageNumbers) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
	const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

	const shouldShowLeftDots = leftSiblingIndex > 2;
	const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

	const firstPageIndex = 1;
	const lastPageIndex = totalPages;

	// Caso 2: No mostrar '...' a la izquierda
	if (!shouldShowLeftDots && shouldShowRightDots) {
		const leftItemCount = 3 + 2 * siblingCount;
		const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
		return [...leftRange, "...", totalPages];
	}

	// Caso 3: No mostrar '...' a la derecha
	if (shouldShowLeftDots && !shouldShowRightDots) {
		const rightItemCount = 3 + 2 * siblingCount;
		const rightRange = Array.from(
			{ length: rightItemCount },
			(_, i) => totalPages - rightItemCount + i + 1,
		);
		return [firstPageIndex, "...", ...rightRange];
	}

	// Caso 4: Mostrar '...' en ambos lados
	if (shouldShowLeftDots && shouldShowRightDots) {
		const middleRange = Array.from(
			{ length: rightSiblingIndex - leftSiblingIndex + 1 },
			(_, i) => leftSiblingIndex + i,
		);
		return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
	}

	// Por si acaso, aunque no debería llegar aquí
	return Array.from({ length: totalPages }, (_, i) => i + 1);
};

export default function PaginationControl<T>({
	table,
}: PaginationControlProps<T>) {
	const { pageIndex, pageSize } = table.getState().pagination;
	const totalPages = table.getPageCount();
	const currentPage = pageIndex + 1; // pageIndex es 0-based

	const paginationRange = getPaginationRange(currentPage, totalPages) || [];

	const goToPage = (page: number) => {
		table.setPageIndex(page - 1); // Convertir a 0-based
	};

	const renderPageButton = (page: string | number, index: number) => {
		const isActive = currentPage === page;

		// --- Botón de Puntos Suspensivos '...' ---
		if (typeof page === "string") {
			return (
				<span key={`dots-${index}`} className="px-3 py-1 text-gray-500">
					...
				</span>
			);
		}

		// --- Botón de Número de Página ---
		return (
			<button
				key={page}
				onClick={() => goToPage(page)}
				className={`
          px-3 py-1 rounded-md text-sm font-medium
          ${
				isActive
					? "bg-blue-600 text-white" // Estilo activo
					: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" // Estilo inactivo
			}
        `}
			>
				{page}
			</button>
		);
	};

	//   Nota: si se quiere ocultar la paginación cuando hay 1 sola página solo descomentar esto:
	//   if (totalPages <= 1) {
	//     return null; // No mostrar paginación si solo hay 1 página
	//   }

	return (
		<div className="flex items-center justify-between gap-4 mt-4 flex-wrap px-2">
			{/* TODO: En modo oscuro no se ven los números */}
			<div className="flex items-center gap-2">
				<span className="text-sm text-gray-700 dark:text-gray-300">
					<FormattedMessage id="show" />
				</span>
				<select
					value={pageSize}
					onChange={(e) => {
						table.setPageSize(Number(e.target.value));
					}}
					className="p-2 border border-gray-300 rounded-md dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white"
				>
					{[5, 10, 20, 50].map((size) => (
						<option key={size} value={size}>
							{size}
						</option>
					))}
				</select>
			</div>

			{/* --- Controles de Paginación Numérica --- */}
			<div className="flex items-center gap-2">
				{/* Botón Anterior */}
				<button
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
					className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<ChevronLeftIcon className="w-5 h-5" />
				</button>

				{/* Números de Página */}
				<div className="flex items-center gap-1">
					{paginationRange.map(renderPageButton)}
				</div>

				{/* Botón Siguiente */}
				<button
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
					className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<ChevronRightIcon className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
}
