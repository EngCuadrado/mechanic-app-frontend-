import { useState } from "react";
import { FaBox } from "react-icons/fa6";
import SimpleModal from "../../../ui/utils/SimpleModal";
import { FormattedMessage, useIntl } from "react-intl";

const InventoryPartDetailsModal = ({ row, onClose }: { row: any, onClose: () => void }) => {
	const intl = useIntl();
	const {
		name,
		imageUrl,
		stockQuantity,
		minStockAlert,
		unitCost,
		taxCost,
		totalUnitCost,
		basePrice,
		currency,
		isActive
	} = row.original;

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "inventory.details", defaultMessage: "Detalles del Repuesto" })}
			widthClass="w-full max-w-md md:max-w-2xl"
		>
			<div className="flex flex-col md:flex-row gap-6 p-4">
				{/* Image Section */}
				<div className="w-full md:w-1/2 flex justify-center items-start">
					{imageUrl ? (
						<img
							src={imageUrl}
							alt={name}
							className="w-full h-auto object-cover rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 max-h-[300px]"
						/>
					) : (
						<div className="w-full h-64 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
							<FaBox className="size-16 text-gray-400 mb-4" />
							<span className="text-gray-500 font-medium">Sin imagen</span>
						</div>
					)}
				</div>

				{/* Details Section */}
				<div className="w-full md:w-1/2 flex flex-col gap-4">
					<div>
						<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{name}</h2>
						<div className="flex items-center gap-2">
							<span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
								{isActive ? "Activo" : "Inactivo"}
							</span>
						</div>
					</div>

					<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 grid grid-cols-2 gap-y-4 gap-x-2">
						<div className="col-span-1">
							<span className="block text-xs text-gray-500 dark:text-gray-400">Inventario Actual</span>
							<span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{stockQuantity} uds.</span>
						</div>
						<div className="col-span-1">
							<span className="block text-xs text-gray-500 dark:text-gray-400">Alerta Mínima</span>
							<span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{minStockAlert} uds.</span>
						</div>

						<div className="col-span-1">
							<span className="block text-xs text-gray-500 dark:text-gray-400">Costo Compra</span>
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currency} {unitCost?.toFixed(2)}</span>
						</div>
						<div className="col-span-1">
							<span className="block text-xs text-gray-500 dark:text-gray-400">IVA</span>
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{taxCost}%</span>
						</div>
						
						<div className="col-span-1">
							<span className="block text-xs text-gray-500 dark:text-gray-400">Costo Total</span>
							<span className="text-base font-semibold text-gray-900 dark:text-gray-100">{currency} {totalUnitCost?.toFixed(2)}</span>
						</div>
						<div className="col-span-1">
							<span className="block text-xs text-brand-600 dark:text-brand-400 font-bold">Precio de Venta</span>
							<span className="text-xl font-bold text-brand-600 dark:text-brand-400">{currency} {basePrice?.toFixed(2)}</span>
						</div>
					</div>
				</div>
			</div>
			
			<div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
				<button
					onClick={onClose}
					className="px-5 py-2 bg-gray-200 rounded-xl text-gray-700 hover:bg-gray-300 transition-colors text-sm font-medium"
					type="button"
				>
					<FormattedMessage id="close" defaultMessage="Cerrar" />
				</button>
			</div>
		</SimpleModal>
	);
};

export const InventoryPartProductInfo = ({ row }: { row: any }) => {
	const [showDetails, setShowDetails] = useState(false);
	const { imageUrl, name } = row.original;

	return (
		<>
			<div className="flex items-center gap-3">
				<button 
					onClick={() => setShowDetails(true)}
					className="focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg transition-transform hover:scale-105"
					title="Ver detalles"
				>
					{imageUrl ? (
						<div className="w-10 h-10 flex-shrink-0 bg-gray-50 dark:bg-dark-800 rounded-lg p-1 border border-gray-100 dark:border-dark-700">
							<img
								src={imageUrl}
								alt={name}
								className="w-full h-full object-cover rounded-md"
							/>
						</div>
					) : (
						<div className="w-10 h-10 flex-shrink-0 bg-gray-100 dark:bg-dark-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-dark-600">
							<FaBox className="size-5 text-gray-400" />
						</div>
					)}
				</button>
				<div className="flex flex-col">
					<button 
						onClick={() => setShowDetails(true)}
						className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 text-left hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
					>
						{name}
					</button>
				</div>
			</div>

			{showDetails && (
				<InventoryPartDetailsModal row={row} onClose={() => setShowDetails(false)} />
			)}
		</>
	);
};
