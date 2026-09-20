import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { TrashIcon, PencilSquareIcon, PlusIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

import SimpleModal from "../../../ui/utils/SimpleModal";
import Input from "../../../form/input/InputField";
import {
	GET_VEHICLE_MODELS_QUERY,
	GET_VEHICLE_BRANDS_QUERY,
	ADD_VEHICLE_BRAND_MUTATION,
	UPDATE_VEHICLE_BRAND_MUTATION,
	DELETE_VEHICLE_BRAND_MUTATION,
} from "../QuerysDefinitions";

export default function ManageVehicleBrands({ onClose }: { onClose: () => void }) {
	const intl = useIntl();
	const [newBrandName, setNewBrandName] = useState("");
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editName, setEditName] = useState("");

	const { data, loading, error } = useQuery(GET_VEHICLE_BRANDS_QUERY());

	const [addBrand, { loading: adding }] = useMutation(ADD_VEHICLE_BRAND_MUTATION, {
		refetchQueries: [{ query: GET_VEHICLE_MODELS_QUERY() }, { query: GET_VEHICLE_BRANDS_QUERY() }],
	});

	const [updateBrand, { loading: updating }] = useMutation(UPDATE_VEHICLE_BRAND_MUTATION, {
		refetchQueries: [{ query: GET_VEHICLE_BRANDS_QUERY() }, { query: GET_VEHICLE_MODELS_QUERY() }],
	});

	const [deleteBrand, { loading: deleting }] = useMutation(DELETE_VEHICLE_BRAND_MUTATION, {
		refetchQueries: [{ query: GET_VEHICLE_BRANDS_QUERY() }],
	});

	const handleAdd = async () => {
		if (!newBrandName.trim()) return;
		try {
			await addBrand({ variables: { brandName: newBrandName } });
			setNewBrandName("");
			toast.success(intl.formatMessage({ id: "brand.add.success", defaultMessage: "Marca agregada" }));
		} catch (e: any) {
			toast.error(e.message || "Error al agregar marca");
		}
	};

	const handleUpdate = async (id: number) => {
		if (!editName.trim()) return;
		try {
			await updateBrand({ variables: { brandId: id, newBrandName: editName } });
			setEditingId(null);
			setEditName("");
			toast.success(intl.formatMessage({ id: "brand.update.success", defaultMessage: "Marca actualizada" }));
		} catch (e: any) {
			toast.error(e.message || "Error al actualizar");
		}
	};

	const handleDelete = async (id: number) => {
		if (!window.confirm(intl.formatMessage({ id: "brand.delete.confirm", defaultMessage: "¿Seguro que deseas eliminar esta marca?" }))) return;
		try {
			await deleteBrand({ variables: { brandId: id } });
			toast.success(intl.formatMessage({ id: "brand.delete.success", defaultMessage: "Marca eliminada" }));
		} catch (e: any) {
			toast.error(e.message || "Error al eliminar");
		}
	};

	const brands = data?.vehicleBrands?.nodes || [];

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "brands.manage", defaultMessage: "Gestionar Marcas" })}
			widthClass="w-full max-w-lg md:max-w-2xl"
			disableOutsideClick={true}
		>
			<div className="space-y-6">
				{/* Add new */}
				<div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
					<div className="flex-1">
						<Input
							type="text"
							placeholder={intl.formatMessage({ id: "brand.new.placeholder", defaultMessage: "Nueva marca..." })}
							value={newBrandName}
							onChange={(e) => setNewBrandName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleAdd()}
						/>
					</div>
					<button
						onClick={handleAdd}
						disabled={adding || !newBrandName.trim()}
						className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2 h-11"
					>
						<PlusIcon className="size-5" />
						<span className="hidden sm:inline">
							<FormattedMessage id="add" defaultMessage="Agregar" />
						</span>
					</button>
				</div>

				{/* List */}
				<div className="max-h-[50vh] overflow-y-auto pr-2 space-y-2">
					{loading && <p className="text-center text-gray-500 py-4">Cargando...</p>}
					{error && <p className="text-center text-red-500 py-4">Error al cargar marcas</p>}
					{!loading && !error && brands.length === 0 && (
						<p className="text-center text-gray-500 py-8 italic">No hay marcas registradas.</p>
					)}
					{brands.map((brand: any) => (
						<div key={brand.brandId} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
							{editingId === brand.brandId ? (
								<div className="flex items-center gap-3 w-full">
									<Input
										type="text"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										autoFocus
										className="flex-1 h-9"
										onKeyDown={(e) => e.key === "Enter" && handleUpdate(brand.brandId)}
									/>
									<button onClick={() => handleUpdate(brand.brandId)} disabled={updating} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
										<CheckIcon className="size-5" />
									</button>
									<button onClick={() => setEditingId(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
										<XMarkIcon className="size-5" />
									</button>
								</div>
							) : (
								<>
									<span className="font-medium text-gray-800 dark:text-gray-200 pl-2">{brand.brandName}</span>
									<div className="flex items-center gap-1">
										<button
											onClick={() => {
												setEditingId(brand.brandId);
												setEditName(brand.brandName);
											}}
											className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
										>
											<PencilSquareIcon className="size-5" />
										</button>
										<button
											onClick={() => handleDelete(brand.brandId)}
											disabled={deleting}
											className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
										>
											<TrashIcon className="size-5" />
										</button>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			</div>
		</SimpleModal>
	);
}
