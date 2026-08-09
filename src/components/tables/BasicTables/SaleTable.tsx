// src/components/features/employee/EmployeeTable.tsx
import { useState, useMemo } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { ServerDataTable } from "../../ui/table/ServerDataTable";
import { GET_ALL_SALES } from "../../ui/table/QuerysDefinitions";
import { useSaleColumns } from "../../ui/table/ColumnsDefinitions";
import DatePicker from "../../form/date-picker";
import dayjs from "dayjs";
import { XMarkIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function SaleTable() {
	const intl = useIntl();
	const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
		start: "",
		end: "",
	});

	const query = GET_ALL_SALES();
	const columns = useSaleColumns();

	const filter = useMemo(() => {
		if (!dateRange.start || !dateRange.end) return null;

		return {
			saleDate: {
				gte: dateRange.start,
				lte: dateRange.end,
			},
		};
	}, [dateRange]);

	const handleDateChange = (selectedDates: Date[]) => {
		if (selectedDates.length === 2) {
			setDateRange({
				start: dayjs(selectedDates[0]).startOf("day").toISOString(),
				end: dayjs(selectedDates[1]).endOf("day").toISOString(),
			});
		} else if (selectedDates.length === 0) {
			setDateRange({ start: "", end: "" });
		}
	};

	const clearFilters = () => {
		setDateRange({ start: "", end: "" });
	};

	const isFiltered = !!dateRange.start || !!dateRange.end;

	const startTour = () => {
		const driverObj = driver({
			showProgress: true,
			nextBtnText: "Siguiente",
			prevBtnText: "Anterior",
			doneBtnText: "Finalizar",
			steps: [
				{
					element: "#tour-sales-date",
					popover: {
						title: "Filtro de Fechas",
						description: "Selecciona un rango de fechas (fecha de inicio y fecha de fin) para filtrar el historial de ventas.",
						side: "bottom",
						align: "end",
					},
				},
				{
					element: "#tour-sales-table",
					popover: {
						title: "Tabla de Ventas",
						description: "Aquí se mostrarán todos los registros de ventas. Si aplicas un filtro de fecha, aparecerá un botón rojo en la parte superior para limpiar tu búsqueda rápidamente.",
						side: "top",
						align: "start",
					},
				},
			],
		});

		driverObj.drive();
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
						<FormattedMessage id="sales.summary" />
					</h3>
				</div>
				<div className="flex items-center gap-2 w-full md:w-auto">
					<button
						id="tour-sales-guide"	
						onClick={startTour}
						className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center justify-center gap-2 cursor-pointer"
					>
						<QuestionMarkCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
						Guía rápida
					</button>
					<div id="tour-sales-date" className="w-full md:w-64 bg-white rounded-xl">
						<DatePicker
							id="sale-date-filter"
							mode="range"
							placeholder={intl.formatMessage({
								id: "sales.select_date_range",
							})}
							value={isFiltered ? [dateRange.start, dateRange.end] : ""}
							onChange={handleDateChange}
						/>
					</div>
					{isFiltered && (
						<button
							onClick={clearFilters}
							className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 transition-colors"
						>
							<XMarkIcon className="size-4" />
							<FormattedMessage id="cancel" />
						</button>
					)}
				</div>
			</div>
			<div id="tour-sales-table">
				<ServerDataTable 
					columns={columns} 
					query={query} 
					queryKeyName="sales" 
					filter={filter}
				/>
			</div>
		</div>
	);
}

