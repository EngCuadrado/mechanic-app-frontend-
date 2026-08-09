import * as XLSX from "xlsx";
import { nicaDate } from "./dateUtils";

/**
 * Configuración para una columna del Excel.
 */
export interface ExcelColumnConfig<T> {
	header: string; // Título de la columna en el Excel
	key?: keyof T; // Propiedad directa del objeto (opcional)
	formatter?: (item: T) => any; // Función para extraer/formatear el dato (opcional)
}

/**
 * Función genérica para exportar datos a Excel.
 *
 * @param data Array de objetos brutos
 * @param columnsConfig Arreglo de configuración de columnas
 * @param filename Nombre base del archivo
 */
export const exportToExcel = <T>(
	data: T[],
	columnsConfig: ExcelColumnConfig<T>[],
	filename: string = "Reporte",
) => {
	// 1. Transformar datos brutos a objetos planos según la configuración
	const flattenedData = data.map((item) => {
		const row: Record<string, any> = {};

		columnsConfig.forEach((col) => {
			if (col.formatter) {
				row[col.header] = col.formatter(item);
			} else if (col.key) {
				row[col.header] = item[col.key];
			} else {
				row[col.header] = "";
			}
		});

		return row;
	});

	// 2. Crear la hoja de trabajo (worksheet) a partir del JSON aplanado
	const worksheet = XLSX.utils.json_to_sheet(flattenedData);

	// 3. Crear un nuevo libro de trabajo (workbook)
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

	// 4. Generar el archivo y disparar la descarga en el navegador
	const fullFilename = `${filename}_${nicaDate().format("YYYY-MM-DD_HHmm")}.xlsx`;
	XLSX.writeFile(workbook, fullFilename);
};
