import React from "react";

const TransactionMedicine = ({ row }: any) => {
	const saleDetails = row.original.saleDetails || [];
	const currency = row.original.currency || "USD";

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("es-NI", {
			style: "currency",
			currency: currency,
		}).format(amount);
	};

	const colors = [
		"bg-blue-100 text-blue-700 border-blue-200",
		"bg-green-100 text-green-700 border-green-200",
		"bg-purple-100 text-purple-700 border-purple-200",
		"bg-orange-100 text-orange-700 border-orange-200",
		"bg-pink-100 text-pink-700 border-pink-200",
		"bg-cyan-100 text-cyan-700 border-cyan-200",
	];

	const getBadgeColor = (index: number) => colors[index % colors.length];

	return (
		<div className="flex flex-wrap gap-1.5 max-w-[350px] py-1">
			{saleDetails.map((detail: any, index: number) => (
				<div
					key={index}
					className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold shadow-sm ${getBadgeColor(index)}`}
				>
					<span>{detail.product?.medicine?.name}</span>
					<div className="flex items-center gap-1 ml-1 pl-1 border-l border-current/20">
						<span className="opacity-70">x{detail.quantity}</span>
					</div>
				</div>
			))}
		</div>
	);
};

export default TransactionMedicine;
