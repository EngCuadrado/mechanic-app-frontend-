export const BatchStock = ({
	current,
	initial,
}: {
	current: number;
	initial: number;
}) => {
	const percentage = initial > 0 ? (current / initial) * 100 : 0;
	const color =
		percentage <= 0
			? "bg-gray-400"
			: percentage <= 15
				? "bg-red-500"
				: percentage <= 50
					? "bg-yellow-500"
					: "bg-green-500";
	return (
		<div
			className="flex flex-col gap-1 w-24"
			data-tooltip-id="global-tooltip" // <--- Debe coincidir con el ID en App.tsx
			data-tooltip-content={`${current} / ${initial}`}
		>
			<div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-100">
				<span>{current} u.</span>
				<span>{Math.round(percentage)}%</span>
			</div>
			{/* Barra de progreso miniatura */}
			<div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700 dark:text-gray-100">
				<div
					className={`h-full ${color} transition-all duration-500`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
};
