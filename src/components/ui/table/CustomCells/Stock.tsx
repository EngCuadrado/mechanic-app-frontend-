const Stock = ({ row }: any) => {
	const { stock_units, min_stock_units } = row.original.product || [];

	/*
	 gris: 		stock <= 0
	 rojo: 		stock <= min_stock
	 amarillo:  stock <= min_stock 150%
	 verde: 	stock > min_stock 150%
  */

	const color =
		stock_units <= 0
			? "bg-gray-500 dark:bg-gray-700"
			: stock_units <= min_stock_units
				? "bg-red-500 dark:bg-red-700"
				: stock_units <= min_stock_units * 1.5
					? "bg-yellow-500 dark:bg-yellow-700"
					: "bg-green-500 dark:bg-green-700";

	return (
		<div className="flex flex-row items-center gap-2">
			<div
				className={`size-3 rounded-full ${color}`}
				data-tooltip-id="global-tooltip" // <--- Debe coincidir con el ID en App.tsx
				data-tooltip-content={`Min. ${min_stock_units}`}
			/>
			{stock_units}
		</div>
	);
};

export default Stock;
