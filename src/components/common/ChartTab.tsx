import { FormattedMessage } from "react-intl";

export type ChartTabOption = "YEARLY" | "MONTHLY" | "DAILY";

interface ChartTabProps {
	selected?: ChartTabOption;
	onSelect?: (option: ChartTabOption) => void;
}

const ChartTab: React.FC<ChartTabProps> = ({
	selected = "DAILY",
	onSelect,
}) => {
	const getButtonClass = (option: ChartTabOption) =>
		selected === option
			? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
			: "text-gray-500 dark:text-gray-400";

	return (
		<div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
			<button
				onClick={() => onSelect?.("YEARLY")}
				className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass(
					"YEARLY",
				)}`}
			>
				<FormattedMessage id="annually" />
			</button>

			<button
				onClick={() => onSelect?.("MONTHLY")}
				className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass(
					"MONTHLY",
				)}`}
			>
				<FormattedMessage id="monthly" />
			</button>

			<button
				onClick={() => onSelect?.("DAILY")}
				className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass(
					"DAILY",
				)}`}
			>
				<FormattedMessage id="daily" />
			</button>
		</div>
	);
};

export default ChartTab;
