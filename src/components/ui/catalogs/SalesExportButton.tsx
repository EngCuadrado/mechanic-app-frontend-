import React from "react";
import { useLazyQuery } from "@apollo/client/react";
import { useIntl } from "react-intl";
import { toast } from "sonner";

import { DownloadIcon } from "../../../icons";
import { exportToExcel, ExcelColumnConfig } from "../../../utils/excelUtils";
import { GET_ALL_SALES } from "../table/QuerysDefinitions";
import { nicaDate } from "../../../utils/dateUtils";

/**
 * Configuración de columnas específica para la exportación de Ventas
 */
// TODO cambiar por intl
const salesColumnsConfig: ExcelColumnConfig<any>[] = [
	{
		header: "ID Venta",
		key: "saleId",
	},
	{
		header: "Fecha",
		formatter: (sale) =>
			sale.saleDate
				? nicaDate(sale.saleDate).format("DD/MM/YYYY HH:mm")
				: "N/A",
	},
	{
		header: "Empleado",
		formatter: (sale) =>
			sale.employee
				? `${sale.employee.names || ""} ${sale.employee.lastnames || ""}`.trim()
				: "N/A",
	},
	{
		header: "Total Neto",
		key: "netTotal",
	},
	{
		header: "Moneda",
		key: "currency",
	},
	{
		header: "Médico",
		key: "doctorName",
	},
	{
		header: "Número de Receta",
		key: "prescriptionNumber",
	},
	{
		header: "Productos",
		formatter: (sale) =>
			sale.saleDetails
				?.map((d: any) => d.product?.medicine?.name || "Desconocido")
				?.join(", ") || "N/A",
	},
	{
		header: "Metodo de pago",
		// formatter: (sale) => sale.salePayments?.[0]?.paymentMethod?.name || 'N/A'
		formatter: (sale) =>
			sale.salePayments
				?.map((d: any) => d.paymentMethod?.name || "Desconocido")
				?.join(", ") || "N/A",
	},
];

const SalesExportButton: React.FC = () => {
	const intl = useIntl();

	// Usamos useLazyQuery para traer los datos solo cuando el usuario haga clic
	const [fetchSales, { loading }] = useLazyQuery(GET_ALL_SALES(), {
		fetchPolicy: "network-only",
	});

	const handleExport = async () => {
		try {
			let allNodes: any[] = [];
			let hasNextPage = true;
			let endCursor: string | undefined = undefined;

			const MAX_PER_PAGE = 50; // Usamos un límite seguro por página (ej. 50)

			while (hasNextPage) {
				const { data, error } = await fetchSales({
					variables: {
						first: MAX_PER_PAGE,
						after: endCursor,
					},
				});

				if (error) {
					throw error;
				}

				const nodes = data?.sales?.nodes || [];
				allNodes = [...allNodes, ...nodes];

				const pageInfo = data?.sales?.pageInfo;
				hasNextPage = pageInfo?.hasNextPage || false;
				endCursor = pageInfo?.endCursor || undefined;
			}

			if (allNodes.length > 0) {
				exportToExcel(allNodes, salesColumnsConfig, "Reporte_Ventas");
				toast.success(
					"El reporte de ventas ha sido exportado con éxito.",
				);
			} else {
				toast.info("No hay ventas disponibles para exportar.");
			}
		} catch (error) {
			toast.error("Error al exportar ventas.");
			console.error("Error al exportar ventas:", error);
		}
	};

	return (
		<button
			onClick={handleExport}
			disabled={loading}
			className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			<DownloadIcon />
			{loading ? "Preparando..." : "Exportar Excel"}
		</button>
	);
};

export default SalesExportButton;
