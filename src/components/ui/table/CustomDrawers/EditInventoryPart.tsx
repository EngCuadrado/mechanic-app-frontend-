import { useState, useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";
import { CurrencyDollarIcon, CubeIcon, BellAlertIcon, PhotoIcon, TagIcon } from "@heroicons/react/24/outline";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Select from "../../../form/Select";

import { useMutation } from "@apollo/client/react";
import { UPDATE_INVENTORY_PART_MUTATION } from "../QuerysDefinitions";
import { FaBox } from "react-icons/fa6";

interface InventoryPartData {
	inventoryPartId: number;
	name: string;
	stockQuantity: number;
	unitCost: number;
	taxCost: number;
	totalUnitCost: number;
	basePrice: number;
	currency: string;
	minStockAlert: number;
	imageUrl?: string;
}

interface EditInventoryPartProps {
	row: { original: InventoryPartData };
	onClose: () => void;
}

export default function EditInventoryPart({ row, onClose }: EditInventoryPartProps) {
	const intl = useIntl();
	const initialData = row.original;

	// Main info
	const [name, setName] = useState(initialData.name || "");
	const [imageFile, setImageFile] = useState<File | null>(null);

	// Stock
	const [stockQuantity, setStockQuantity] = useState(initialData.stockQuantity || 0);
	const [minStockAlert, setMinStockAlert] = useState(initialData.minStockAlert || 0);

	// Costs & Pricing
	const [unitCost, setUnitCost] = useState(initialData.unitCost || 0);
	const [taxCost, setTaxCost] = useState(initialData.taxCost || 15);
	const [totalUnitCost, setTotalUnitCost] = useState(initialData.totalUnitCost || 0);
	const [basePrice, setBasePrice] = useState(initialData.basePrice || 0);
	const [currency, setCurrency] = useState(initialData.currency || "NIO");

	const [mutateFunction, { loading }] = useMutation(UPDATE_INVENTORY_PART_MUTATION, {
		refetchQueries: ["GetInventoryParts"],
	});

	// Auto-calculate total unit cost
	useEffect(() => {
		const uc = parseFloat(unitCost.toString()) || 0;
		const tc = parseFloat(taxCost.toString()) || 0;
		const total = uc + (uc * (tc / 100));
		setTotalUnitCost(parseFloat(total.toFixed(2)));
	}, [unitCost, taxCost]);

	const handleSubmit = async () => {
		if (!name || stockQuantity < 0 || basePrice < 0) {
			toast.error(intl.formatMessage({ id: "error.requiredFields", defaultMessage: "Verifique los campos requeridos." }));
			return;
		}

		try {
			const { errors } = await mutateFunction({
				variables: {
					inventoryPartId: Number(initialData.inventoryPartId),
					name,
					stockQuantity: parseInt(stockQuantity.toString(), 10),
					unitCost: parseFloat(unitCost.toString()),
					taxCost: parseFloat(taxCost.toString()),
					totalUnitCost: parseFloat(totalUnitCost.toString()),
					basePrice: parseFloat(basePrice.toString()),
					currency,
					minStockAlert: parseInt(minStockAlert.toString(), 10),
					imageUrl: initialData.imageUrl || null,
					imageFile: imageFile,
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
		<div className="p-4 sm:p-5 overflow-y-auto max-h-[80vh]">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				
				{/* Nombre */}
				<div className="col-span-1 sm:col-span-2">
					<Label htmlFor="name_input">
						<FormattedMessage id="name" defaultMessage="Nombre" /> *
					</Label>
					<div className="relative mt-1">
						<Input
							type="text"
							id="name_input"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="pl-[42px]"
							placeholder="Ej: Filtro de Aceite"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<FaBox className="size-5" />
						</span>
					</div>
				</div>

				{/* Stock */}
				<div className="col-span-1">
					<Label htmlFor="stock_input">
						<FormattedMessage id="stockQuantity" defaultMessage="Cant. Inicial" /> *
					</Label>
					<div className="relative mt-1">
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

				{/* Min Stock */}
				<div className="col-span-1">
					<Label htmlFor="minStockAlert_input">
						<FormattedMessage id="minStockAlert" defaultMessage="Alerta M�nima" />
					</Label>
					<div className="relative mt-1">
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

				{/* Unit Cost */}
				<div className="col-span-1">
					<Label htmlFor="unitCost_input">
						<FormattedMessage id="unitCost" defaultMessage="Costo de Compra" />
					</Label>
					<div className="relative mt-1">
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

				{/* Tax */}
				<div className="col-span-1">
					<Label htmlFor="taxCost_input">
						<FormattedMessage id="taxCost" defaultMessage="IVA (%)" />
					</Label>
					<div className="relative mt-1">
						<Input
							type="number"
							step="0.01"
							id="taxCost_input"
							value={taxCost}
							onChange={(e) => setTaxCost(Number(e.target.value))}
							className="pl-[42px]"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<TagIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Total Unit Cost */}
				<div className="col-span-1">
					<Label htmlFor="totalUnitCost_input">
						<FormattedMessage id="totalUnitCost" defaultMessage="Costo Total" />
					</Label>
					<div className="relative mt-1">
						<Input
							type="number"
							step="0.01"
							id="totalUnitCost_input"
							value={totalUnitCost}
							onChange={(e) => setTotalUnitCost(Number(e.target.value))}
							className="pl-[42px] bg-gray-50 dark:bg-gray-800"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<CurrencyDollarIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Base Price */}
				<div className="col-span-1">
					<Label htmlFor="basePrice_input">
						<FormattedMessage id="basePrice" defaultMessage="Precio Venta" /> *
					</Label>
					<div className="relative mt-1">
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

				{/* Currency */}
				<div className="col-span-1">
					<Label htmlFor="currency_input">
						<FormattedMessage id="currency" defaultMessage="Moneda" />
					</Label>
					<div className="relative mt-1">
						<Select
							options={[
								{ value: "NIO", label: "NIO" },
								{ value: "USD", label: "USD" }
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

				{/* Image */}
				<div className="col-span-1">
					<Label htmlFor="image_input">
						<FormattedMessage id="image" defaultMessage="Imagen" />
					</Label>
					<div className="relative mt-1">
						<Input
							type="file"
							id="image_input"
							accept="image/*"
							capture="environment"
							onChange={(e) => {
								setImageFile(e.target.files?.[0] || null);
							}}
							className="pl-[38px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/30 dark:file:text-brand-400"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<PhotoIcon className="size-5" />
						</span>
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
				<button
					onClick={onClose}
					className="px-4 py-2 bg-gray-200 rounded-xl text-gray-700 hover:bg-gray-300 transition-colors text-sm font-medium"
					type="button"
				>
					<FormattedMessage id="cancel" defaultMessage="Cancelar" />
				</button>
				<button
					onClick={handleSubmit}
					disabled={loading}
					className="px-5 py-2 text-white rounded-xl transition-colors flex items-center justify-center bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed shadow-sm text-sm font-medium"
				>
					<FormattedMessage id="save" defaultMessage="Guardar" />
				</button>
			</div>
		</div>
	);
}
