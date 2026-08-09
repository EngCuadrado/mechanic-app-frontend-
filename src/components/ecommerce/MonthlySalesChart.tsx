import flatpickr from "flatpickr";
import Chart from "react-apexcharts";
import "flatpickr/dist/flatpickr.css";
import { useState, useEffect, useRef } from "react";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { useIntl, FormattedMessage } from "react-intl";

import { ApexOptions } from "apexcharts";
import { CalenderIcon } from "../../icons";
import { useQuery } from "@apollo/client/react";
import ChartTab, { ChartTabOption } from "../common/ChartTab";
import { GET_DASHBOARD_SALE_SUMMARY } from "../ui/table/QuerysDefinitions";
import Loading from "../ui/loading/Loading";
import { nicaDate, nowInNica } from "../../utils/dateUtils";

import dayjs from "dayjs";

export default function MonthlySalesChart() {
	const intl = useIntl();
	const [chartType, setChartType] = useState<ChartTabOption>("DAILY");

	// Default range: last 7 days in NIC time
	const [dateRange, setDateRange] = useState<{
		start: dayjs.Dayjs;
		end: dayjs.Dayjs;
	}>(() => {
		const end = nowInNica();
		const start = nowInNica().subtract(6, "day");
		return { start, end };
	});

	const { data, loading, error } = useQuery(GET_DASHBOARD_SALE_SUMMARY, {
		variables: {
			startDate: nicaDate(dateRange.start).startOf("day").toISOString(),
			endDate: nicaDate(dateRange.end).endOf("day").toISOString(),
			type: chartType,
		},
		fetchPolicy: "network-only",
	});

	const formatChartLabel = (label: string) => {
		const date = nicaDate(label);
		if (!date.isValid()) return label;

		let formatted = "";
		switch (chartType) {
			case "DAILY":
				formatted = date.format("DD MMMM");
				break;
			case "MONTHLY":
				formatted = date.format("MMMM");
				break;
			case "YEARLY":
				formatted = date.format("YYYY");
				break;
			default:
				formatted = label;
		}

		// Capitalize first letter (e.g., "mayo" -> "Mayo")
		return formatted.charAt(0).toUpperCase() + formatted.slice(1);
	};

	const chartLabels =
		data?.salesStats?.map((stat: any) => formatChartLabel(stat.label)) || [];
	const chartValues = data?.salesStats?.map((stat: any) => stat.value) || [];

	const options: ApexOptions = {
		colors: ["#465fff"],
		chart: {
			fontFamily: "Outfit, sans-serif",
			type: "bar",
			height: 180,
			toolbar: {
				show: false,
			},
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: "15%",
				borderRadius: 5,
				borderRadiusApplication: "end",
			},
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			show: true,
			width: 4,
			colors: ["transparent"],
		},
		xaxis: {
			categories: chartLabels,
			axisBorder: {
				show: false,
			},
			axisTicks: {
				show: false,
			},
		},
		legend: {
			show: true,
			position: "top",
			horizontalAlign: "left",
			fontFamily: "Outfit",
		},
		yaxis: {
			title: {
				text: undefined,
			},
		},
		grid: {
			yaxis: {
				lines: {
					show: true,
				},
			},
		},
		fill: {
			opacity: 1,
		},

		tooltip: {
			x: {
				show: false,
			},
			y: {
				formatter: (val: number) => `${val}`,
			},
		},
	};

	const series = [
		{
			name: intl.formatMessage({ id: "sales" }, { count: 2 }),
			data: chartValues,
		},
	];

	const datePickerRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!datePickerRef.current) return;

		const fp = flatpickr(datePickerRef.current, {
			mode: "range",
			locale: Spanish,
			static: true,
			monthSelectorType: "static",
			dateFormat: "M d",
			defaultDate: [
				nicaDate(dateRange.start).toDate(),
				nicaDate(dateRange.end).toDate(),
			],
			clickOpens: true,
			onChange: (selectedDates) => {
				if (selectedDates.length === 2) {
					setDateRange({
						start: nicaDate(selectedDates[0]),
						end: nicaDate(selectedDates[1]),
					});
				}
			},
			prevArrow:
				'<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
			nextArrow:
				'<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		});

		return () => {
			if (!Array.isArray(fp)) {
				fp.destroy();
			}
		};
	}, []);

	return (
		<div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 sm:pb-6">
			<div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between sm:items-center">
				<h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
					<FormattedMessage id="sales.summary" />
				</h3>
				<div className="flex flex-wrap items-center gap-3">
					<div id="tour-chart-tabs">
						<ChartTab selected={chartType} onSelect={setChartType} />
					</div>
					<div id="tour-chart-picker" className="relative inline-flex items-center">
						<CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
						<input
							ref={datePickerRef}
							className="z-100 h-10 w-45 pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
							placeholder={intl.formatMessage({
								id: "sales.select_date_range",
							})}
						/>
					</div>
				</div>
			</div>

			<div className="max-w-full overflow-x-auto custom-scrollbar">
				<div id="tour-sales-graph" className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
					{loading ? (
						<div className="h-75">
							<Loading className="h-[210px]" />
						</div>
					) : error ? (
						<div className="flex items-center justify-center h-[210px] text-error-500">
							<FormattedMessage id="sales.error.loading_stats" />
						</div>
					) : (
						<Chart
							options={options}
							series={series}
							type="bar"
							height={180}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
