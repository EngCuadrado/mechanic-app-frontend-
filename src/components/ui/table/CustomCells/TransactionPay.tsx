import { Tooltip } from "@mui/material";
import {
	CreditCardIcon,
	BanknotesIcon,
	CurrencyDollarIcon,
	ArrowDownCircleIcon
} from "@heroicons/react/24/outline";

const TransactionPay = ({ row }: any) => {
	const payments = row.original.salePayments || [];
	const netTotal = row.original.netTotal;
	const currency = row.original.currency || "USD";

	const getPaymentIcon = (id: number, className = "size-4") => {
		switch (id) {
			case 1:
				return (
					<BanknotesIcon className={`${className} text-green-600`} />
				);
			case 2:
				return (
					<CreditCardIcon className={`${className} text-blue-600`} />
				);
			case 3:
				return (
					<ArrowDownCircleIcon className={`${className} text-purple-600`} />
				);
			default:
				return (
					<CreditCardIcon className={`${className} text-gray-500`} />
				);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("es-NI", {
			style: "currency",
			currency: currency,
		}).format(amount);
	};

	const hasMultiplePayments = payments.length > 1;

	const TooltipContent = (
		<div className="flex flex-col gap-2 p-1">
			<span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
				Desglose de Pago
			</span>
			{payments.map((p: any, index: number) => (
				<div key={index} className="flex items-center gap-2">
					{getPaymentIcon(
						p.paymentMethod?.paymentMethodId,
						"size-3.5",
					)}
					<span className="text-xs font-medium text-gray-700 dark:text-white">
						{p.paymentMethod?.name}:
					</span>
					<span className="text-xs font-bold text-gray-900 dark:text-gray-200">
						{formatCurrency(p.amount)}
					</span>
				</div>
			))}
		</div>
	);

	return (
		<div className="flex flex-col justify-center h-full py-1">
			<Tooltip
				title={TooltipContent}
				arrow
				placement="top"
				slotProps={{
					tooltip: {
						sx: {
							bgcolor: "#ffffff",
							color: "#000000",
							border: "1px solid #e2e8f0",
							boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
							".dark &": {
								bgcolor: "rgba(15, 23, 42, 0.95)",
								color: "#ffffff",
								border: "1px solid rgba(51, 65, 85, 0.5)",
								backdropFilter: "blur(4px)",
							},
						},
					},
					arrow: {
						sx: {
							color: "#ffffff",
							".dark &": {
								color: "rgba(15, 23, 42, 0.95)",
							},
						},
					},
				}}
			>
				<div
					className={`flex flex-row items-center gap-2 cursor-help`}
				>
					{hasMultiplePayments ? (
						<CurrencyDollarIcon className="size-4 text-amber-500" />
					) : (
						getPaymentIcon(
							payments[0]?.paymentMethod?.paymentMethodId,
						)
					)}

					<span className="text-sm font-bold text-gray-900 dark:text-white">
						{formatCurrency(netTotal)}
					</span>

					{hasMultiplePayments && (
						<span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-black border border-amber-200">
							+{payments.length}
						</span>
					)}
				</div>
			</Tooltip>
		</div>
	);
};

export default TransactionPay;
