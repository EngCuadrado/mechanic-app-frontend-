import React from "react";
import { DownloadIcon } from "../../icons";
import { exportSalesToExcel, SaleNode } from "../../utils/excelUtils";

interface ExportSalesButtonProps {
	sales: SaleNode[];
	loading?: boolean;
}

/**
 * Componente de botón para exportar ventas a Excel.
 *
 * @param sales Array de ventas obtenidas de la query
 * @param loading Estado de carga (opcional)
 */
const ExportSalesButton: React.FC<ExportSalesButtonProps> = ({
	sales,
	loading = false,
}) => {
	const handleExport = () => {
		if (sales && sales.length > 0) {
			exportSalesToExcel(sales);
		}
	};

	return (
		<button
			onClick={handleExport}
			disabled={loading || !sales || sales.length === 0}
			className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			<DownloadIcon />
			Exportar a Excel
		</button>
	);
};

export default ExportSalesButton;
