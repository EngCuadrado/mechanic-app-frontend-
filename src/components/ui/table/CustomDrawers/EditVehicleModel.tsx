import { useState, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Select from "../../../form/Select";

import { useMutation, useQuery } from "@apollo/client/react";
import { UPDATE_VEHICLE_MODEL_MUTATION, GET_VEHICLE_MODELS_QUERY, GET_VEHICLE_BRANDS_QUERY } from "../QuerysDefinitions";

export default function EditVehicleModel({ row, onClose }: { row: any; onClose?: () => void }) {
	const intl = useIntl();
    const { modelId, modelName: initialModelName, brand } = row.original;

	const [modelName, setModelName] = useState(initialModelName || "");
	const [brandId, setBrandId] = useState<string>(brand?.brandId ? String(brand.brandId) : row.original.brandId ? String(row.original.brandId) : "");

	const [mutateFunction, { loading: saving }] = useMutation(UPDATE_VEHICLE_MODEL_MUTATION, {
		refetchQueries: [{ query: GET_VEHICLE_MODELS_QUERY() }],
	});

	const { data: brandsData, loading: loadingBrands } = useQuery(GET_VEHICLE_BRANDS_QUERY());

	const brandOptions = useMemo(() => {
		if (!brandsData?.vehicleBrands?.nodes) return [];
		return brandsData.vehicleBrands.nodes.map((node: any) => ({
			value: String(node.brandId),
			label: node.brandName,
		}));
	}, [brandsData]);

	const handleSubmit = async () => {
		if (!brandId) {
			toast.error(intl.formatMessage({ id: "model.error.brandRequired", defaultMessage: "Seleccione una marca" }));
			return;
		}

		try {
			await mutateFunction({
				variables: {
                    modelId: Number(modelId),
					newModelName: modelName,
					newBrandId: Number(brandId),
				},
			});

			toast.success(intl.formatMessage({ id: "model.update.success", defaultMessage: "Modelo actualizado correctamente" }));
			if (onClose) onClose();
		} catch (err) {
			console.error("Error al guardar:", err);
			toast.error(intl.formatMessage({ id: "model.update.error", defaultMessage: "Error al actualizar modelo" }));
		}
	};

	return (
		<div title="">
			<div className="space-y-6">
				{/* Model Name */}
				<div>
					<Label htmlFor="modelName_input">
						<FormattedMessage id="modelName" defaultMessage="Nombre del Modelo" />
					</Label>
					<Input
						type="text"
						id="modelName_input"
						value={modelName}
						onChange={(e) => setModelName(e.target.value)}
					/>
				</div>

				{/* Brand ID */}
				<div>
					<Label>
						<FormattedMessage id="brandId" defaultMessage="Marca" />
					</Label>
					<Select
						options={brandOptions}
						value={brandId}
						onChange={(val) => setBrandId(val)}
						placeholder={loadingBrands ? "Cargando..." : "Seleccione una marca"}
					/>
				</div>

				<div className="flex flex-row justify-end">
					<button
						onClick={handleSubmit}
						disabled={saving}
						className="px-4 py-2 text-white rounded-xl transition-colors flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
					>
						<FormattedMessage id="save" defaultMessage="Guardar" />
					</button>
				</div>
			</div>
		</div>
	);
}
