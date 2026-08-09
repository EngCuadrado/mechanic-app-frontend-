import React from "react";
import { useLazyQuery } from "@apollo/client/react";
import { toast } from "sonner";

import { DownloadIcon } from "../../../icons";
import { exportToExcel, ExcelColumnConfig } from "../../../utils/excelUtils";
import { GET_MEDICINE_QUERY } from "../table/QuerysDefinitions";

/**
 * Configuración de columnas específica para la exportación de Medicinas
 */
const medicineColumnsConfig: ExcelColumnConfig<any>[] = [
	{
		header: "Nombre",
		key: "name",
	},
	{
		header: "Descripción",
		key: "description",
	},
	{
		header: "Receta Médica",
		formatter: (m) => (m.requires_prescription ? "Sí" : "No"),
	},
	{
		header: "Marca",
		formatter: (m) => m.brand?.name || "N/A",
	},
	{
		header: "Fabricante",
		formatter: (m) => m.manufacturer?.name || "N/A",
	},
	{
		header: "Categoría",
		formatter: (m) => m.category?.name || "N/A",
	},
	{
		header: "Vía de Administración",
		formatter: (m) => m.administration_route?.name || "N/A",
	},
	{
		header: "Principios Activos",
		formatter: (m) =>
			m.medicine_active_ingredients
				?.map(
					(ai: any) =>
						`${ai.active_ingredient?.name || ""} ${ai.dose_value || ""} ${ai.dose_unit?.abbreviation || ""}`.trim(),
				)
				?.join(", ") || "N/A",
	},
	{
		header: "Código de Barras",
		formatter: (m) => m.product?.barcode || "N/A",
	},
	{
		header: "Existencias (Unidades)",
		formatter: (m) => m.product?.stock_units ?? 0,
	},
	{
		header: "Stock Mínimo",
		formatter: (m) => m.product?.min_stock_units ?? 0,
	},
	{
		header: "Precio Unitario",
		formatter: (m) => m.product?.price_per_unit ?? 0,
	},
	{
		header: "Precio Caja",
		formatter: (m) => m.product?.price_full_presentation ?? 0,
	},
	{
		header: "Precio de Costo",
		formatter: (m) => m.product?.cost_price ?? 0,
	},
	{
		header: "Moneda",
		formatter: (m) => m.product?.currency || "N/A",
	},
	{
		header: "Unidades por Caja",
		formatter: (m) => m.product?.units_per_presentation ?? 0,
	},
	{
		header: "Es Fraccionable",
		formatter: (m) => (m.product?.is_fractionable ? "Sí" : "No"),
	},
];

const MedicineExportButton: React.FC = () => {
	const [fetchMedicines, { loading }] = useLazyQuery(GET_MEDICINE_QUERY(), {
		fetchPolicy: "network-only",
	});

	const handleExport = async () => {
		try {
			let allNodes: any[] = [];
			let hasNextPage = true;
			let endCursor: string | undefined = undefined;

			const MAX_PER_PAGE = 50;

			while (hasNextPage) {
				const { data, error } = await fetchMedicines({
					variables: {
						first: MAX_PER_PAGE,
						after: endCursor,
					},
				});

				if (error) {
					throw error;
				}

				const nodes = data?.medicines?.nodes || [];
				allNodes = [...allNodes, ...nodes];

				const pageInfo = data?.medicines?.pageInfo;
				hasNextPage = pageInfo?.hasNextPage || false;
				endCursor = pageInfo?.endCursor || undefined;
			}

			if (allNodes.length > 0) {
				exportToExcel(allNodes, medicineColumnsConfig, "Reporte_Inventario_Medicinas");
				toast.success("El inventario ha sido exportado con éxito.");
			} else {
				toast.info("No hay productos disponibles para exportar.");
			}
		} catch (error) {
			toast.error("Error al exportar inventario.");
			console.error("Error al exportar inventario:", error);
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

export default MedicineExportButton;
