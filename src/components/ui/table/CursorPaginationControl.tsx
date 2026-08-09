// src/components/ui/table/CursorPaginationControl.tsx
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { FormattedMessage } from "react-intl";

interface CursorPaginationProps {
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onNext: () => void;
	onPrevious: () => void;
	loading: boolean;
	pageSize: number;
	setPageSize: (size: number) => void;
}

export default function CursorPaginationControl({
	hasNextPage,
	hasPreviousPage,
	onNext,
	onPrevious,
	loading,
	pageSize,
	setPageSize,
}: CursorPaginationProps) {
	const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setPageSize(Number(e.target.value));
	};

	return (
		<div className="flex items-center justify-between gap-4 mt-4 px-2 flex-wrap">
			{/* --- SECTOR IZQUIERDO: Selector de Filas --- */}
			<div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
				<span className="hidden sm:inline">
					<FormattedMessage id="show" defaultMessage="Mostrar" />
				</span>

				<select
					value={pageSize}
					onChange={handlePageSizeChange}
					disabled={loading}
					className="p-1.5 border border-gray-300 rounded-md bg-white dark:bg-white/[0.05] dark:border-white/[0.1] focus:ring-2 focus:ring-blue-500 outline-none"
				>
					{[5, 10, 20, 50].map((size) => (
						<option key={size} value={size}>
							{size}
						</option>
					))}
				</select>

				<span className="hidden sm:inline">
					<FormattedMessage id="rows" defaultMessage="filas" />
				</span>
			</div>

			{/* --- SECTOR DERECHO: Botones Anterior / Siguiente --- */}
			<div className="flex items-center gap-2">
				<button
					onClick={onPrevious}
					disabled={!hasPreviousPage || loading}
					className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<ChevronLeftIcon className="w-4 h-4" />
					<span className="hidden sm:inline">
						<FormattedMessage id="prev" defaultMessage="Anterior" />
					</span>
				</button>

				<button
					onClick={onNext}
					disabled={!hasNextPage || loading}
					className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<span className="hidden sm:inline">
						<FormattedMessage
							id="next"
							defaultMessage="Siguiente"
						/>
					</span>
					<ChevronRightIcon className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
}
