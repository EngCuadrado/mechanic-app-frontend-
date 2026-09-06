import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";
import { CurrencyDollarIcon, CubeIcon, BellAlertIcon, PhotoIcon } from "@heroicons/react/24/outline";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Select from "../../../form/Select";

import { useMutation } from "@apollo/client/react";
import { CREATE_INVENTORY_PART_MUTATION, GET_INVENTORY_PARTS_QUERY } from "../QuerysDefinitions";
import { FaBox } from "react-icons/fa6";

export default function AddNewInventoryPart({ onClose }: { onClose?: () => void }) {
	const intl = useIntl();

	const [name, setName] = useState("");
	const [stockQuantity, setStockQuantity] = useState(0);
	const [unitCost, setUnitCost] = useState(0);
	const [taxCost, setTaxCost] = useState(0);
	const [totalUnitCost, setTotalUnitCost] = useState(0);
	const [basePrice, setBasePrice] = useState(0);
	const [currency, setCurrency] = useState("NIO");
	const [minStockAlert, setMinStockAlert] = useState(0);
	const [imageFile, setImageFile] = useState<File | null>(null);

	const [mutateFunction, { loading }] = useMutation(CREATE_INVENTORY_PART_MUTATION, {
		refetchQueries: ["GetInventoryParts"],
	});

	const handleSubmit = async () => {
		if (!name || stockQuantity < 0 || basePrice < 0) {
			toast.error(intl.formatMessage({ id: "error.requiredFields", defaultMessage: "Verifique los campos requeridos." }));
			return;
		}

		try {
			const { errors } = await mutateFunction({
				variables: {
					imageUrl: null,
					imageFile: imageFile,
					name,
					stockQuantity: parseInt(stockQuantity.toString(), 10),
					unitCost: parseFloat(unitCost.toString()),
					taxCost: parseFloat(taxCost.toString()),
					totalUnitCost: parseFloat(totalUnitCost.toString()),
					basePrice: parseFloat(basePrice.toString()),
					currency,
					minStockAlert: parseInt(minStockAlert.toString(), 10),
				},
			});

			if (errors) {
				toast.error(errors[0].message);
			} else {
				toast.success(intl.formatMessage({ id: "success.saved", defaultMessage: "Guardado exitosamente" }));
				if (onClose) onClose();
			}
		} catch (error: any) {
			toast.error(error.message || "Error al guardar");
		}
	};

	return (
		<div className="p-4 sm:p-6 pb-20 sm:pb-6 overflow-y-auto max-h-[85vh]">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Name */}
				<div className="col-span-1 md:col-span-2">
					<Label htmlFor="name_input">
						<FormattedMessage id="name" defaultMessage="Nombre del producto" /> *
					</Label>
					<div className="relative">
						<Input
							type="text"
							id="name_input"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="pl-[42px]"
							placeholder="Filtro de Aceite"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<FaBox className="size-5" />
						</span>
					</div>
				</div>

				{/* Currency */}
				<div className="col-span-1">
					<Label htmlFor="currency_input">
						<FormattedMessage id="currency" defaultMessage="Moneda" />
					</Label>
					<div className="relative">
						<Select
							options={[
								{ value: "USD", label: "USD - Dólares" },
								{ value: "NIO", label: "NIO - Córdobas" }
							]}
							value={currency}
							onChange={(val) => setCurrency(val)}
							className="pl-[42px]"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500 pointer-events-none">
							<CurrencyDollarIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Stock Quantity */}
				<div className="col-span-1">
					<Label htmlFor="stock_input">
						<FormattedMessage id="stockQuantity" defaultMessage="Cantidad en Stock" /> *
					</Label>
					<div className="relative">
						<Input
							type="number"
							id="stock_input"
							value={stockQuantity}
							onChange={(e) => setStockQuantity(Number(e.target.value))}
							className="pl-[42px]"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<CubeIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Unit Cost */}
				<div className="col-span-1">
					<Label htmlFor="unitCost_input">
						<FormattedMessage id="unitCost" defaultMessage="Costo Unitario" />
					</Label>
					<div className="relative">
						<Input
							type="number"
							step="0.01"
							id="unitCost_input"
							value={unitCost}
							onChange={(e) => setUnitCost(Number(e.target.value))}
							className="pl-[42px]"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<CurrencyDollarIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Tax Cost */}
				<div className="col-span-1">
					<Label htmlFor="taxCost_input">
						<FormattedMessage id="taxCost" defaultMessage="Impuestos" />
					</Label>
					<div className="relative">
						<Input
							type="number"
							step="0.01"
							id="taxCost_input"
							value={taxCost}
							onChange={(e) => setTaxCost(Number(e.target.value))}
							className="pl-[42px]"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<CurrencyDollarIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Total Unit Cost */}
				<div className="col-span-1">
					<Label htmlFor="totalUnitCost_input">
						<FormattedMessage id="totalUnitCost" defaultMessage="Costo Unitario Total" />
					</Label>
					<div className="relative">
						<Input
							type="number"
							step="0.01"
							id="totalUnitCost_input"
							value={totalUnitCost}
							onChange={(e) => setTotalUnitCost(Number(e.target.value))}
							className="pl-[42px]"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<CurrencyDollarIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Base Price */}
				<div className="col-span-1">
					<Label htmlFor="basePrice_input">
						<FormattedMessage id="basePrice" defaultMessage="Precio Base" /> *
					</Label>
					<div className="relative">
						<Input
							type="number"
							step="0.01"
							id="basePrice_input"
							value={basePrice}
							onChange={(e) => setBasePrice(Number(e.target.value))}
							className="pl-[42px]"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<CurrencyDollarIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Min Stock Alert */}
				<div className="col-span-1 md:col-span-2">
					<Label htmlFor="minStockAlert_input">
						<FormattedMessage id="minStockAlert" defaultMessage="Alerta de Stock Mínimo" />
					</Label>
					<div className="relative">
						<Input
							type="number"
							id="minStockAlert_input"
							value={minStockAlert}
							onChange={(e) => setMinStockAlert(Number(e.target.value))}
							className="pl-[42px]"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<BellAlertIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Image URL */}
				<div className="col-span-1 md:col-span-2">
					<Label htmlFor="image_input">
						<FormattedMessage id="image" defaultMessage="Imagen del repuesto" />
					</Label>
					<div className="relative">
						<Input
							type="file"
							id="image_input"
							accept="image/*"
							onChange={(e) => {
								setImageFile(e.target.files?.[0] || null);
							}}
							className="pl-[42px] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/30 dark:file:text-brand-400"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<PhotoIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Actions */}
				<div className="col-span-1 md:col-span-2 flex justify-end mt-4">
					<button
						onClick={handleSubmit}
						disabled={loading}
						className="px-6 py-2.5 text-white rounded-xl transition-colors flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed shadow-sm shadow-brand-500/20"
					>
						<FormattedMessage id="save" defaultMessage="Guardar" />
					</button>
				</div>
			</div>
		</div>
	);
}
