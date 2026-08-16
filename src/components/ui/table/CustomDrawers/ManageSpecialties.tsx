import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { TrashIcon, PencilSquareIcon, PlusIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

import SimpleModal from "../../../ui/utils/SimpleModal";
import Input from "../../../form/input/InputField";
import {
	GET_MECHANICS_QUERY,
	GET_MECHANIC_SPECIALTIES_QUERY,
	ADD_MECHANIC_SPECIALTY_MUTATION,
	UPDATE_MECHANIC_SPECIALTY_MUTATION,
	DELETE_MECHANIC_SPECIALTY_MUTATION,
} from "../QuerysDefinitions";

export default function ManageSpecialties({ onClose }: { onClose: () => void }) {
	const intl = useIntl();
	const [newSpecialtyName, setNewSpecialtyName] = useState("");
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editName, setEditName] = useState("");

	const { data, loading, error } = useQuery(GET_MECHANIC_SPECIALTIES_QUERY());

	const [addSpecialty, { loading: adding }] = useMutation(ADD_MECHANIC_SPECIALTY_MUTATION, {
		refetchQueries: [{ query: GET_MECHANICS_QUERY() }, { query: GET_MECHANIC_SPECIALTIES_QUERY() }],
	});

	const [updateSpecialty, { loading: updating }] = useMutation(UPDATE_MECHANIC_SPECIALTY_MUTATION, {
		refetchQueries: [{ query: GET_MECHANIC_SPECIALTIES_QUERY() }, { query: GET_MECHANICS_QUERY() }], // Need GET_MECHANICS_QUERY to refresh main table if names changed
	});

	const [deleteSpecialty, { loading: deleting }] = useMutation(DELETE_MECHANIC_SPECIALTY_MUTATION, {
		refetchQueries: [{ query: GET_MECHANIC_SPECIALTIES_QUERY() }],
	});



	const handleAdd = async () => {
		if (!newSpecialtyName.trim()) return;
		try {
			await addSpecialty({ variables: { name: newSpecialtyName } });
			setNewSpecialtyName("");
			toast.success(intl.formatMessage({ id: "specialty.add.success", defaultMessage: "Especialidad agregada" }));
		} catch (e: any) {
			toast.error(e.message || "Error al agregar especialidad");
		}
	};

	const handleUpdate = async (id: number) => {
		if (!editName.trim()) return;
		try {
			await updateSpecialty({ variables: { specialtyId: id, newName: editName } });
			setEditingId(null);
			setEditName("");
			toast.success(intl.formatMessage({ id: "specialty.update.success", defaultMessage: "Especialidad actualizada" }));
		} catch (e: any) {
			toast.error(e.message || "Error al actualizar");
		}
	};

	const handleDelete = async (id: number) => {
		if (!window.confirm(intl.formatMessage({ id: "specialty.delete.confirm", defaultMessage: "¿Seguro que deseas eliminar esta especialidad?" }))) return;
		try {
			await deleteSpecialty({ variables: { specialtyId: id } });
			toast.success(intl.formatMessage({ id: "specialty.delete.success", defaultMessage: "Especialidad eliminada" }));
		} catch (e: any) {
			toast.error(e.message || "Error al eliminar");
		}
	};

	const specialties = data?.mechanicSpecialties?.nodes || [];

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "specialties.manage", defaultMessage: "Gestionar Especialidades" })}
			widthClass="w-full max-w-lg md:max-w-2xl"
			disableOutsideClick={true}
		>
			<div className="space-y-6">
				{/* Add new */}
				<div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
					<div className="flex-1">
						<Input
							type="text"
							placeholder={intl.formatMessage({ id: "specialty.new.placeholder", defaultMessage: "Nueva especialidad..." })}
							value={newSpecialtyName}
							onChange={(e) => setNewSpecialtyName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleAdd()}
						/>
					</div>
					<button
						onClick={handleAdd}
						disabled={adding || !newSpecialtyName.trim()}
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
					{error && <p className="text-center text-red-500 py-4">Error al cargar especialidades</p>}
					{!loading && !error && specialties.length === 0 && (
						<p className="text-center text-gray-500 py-8 italic">No hay especialidades registradas.</p>
					)}
					{specialties.map((spec: any) => (
						<div key={spec.specialtyId} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
							{editingId === spec.specialtyId ? (
								<div className="flex items-center gap-3 w-full">
									<Input
										type="text"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										autoFocus
										className="flex-1 h-9"
										onKeyDown={(e) => e.key === "Enter" && handleUpdate(spec.specialtyId)}
									/>
									<button onClick={() => handleUpdate(spec.specialtyId)} disabled={updating} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
										<CheckIcon className="size-5" />
									</button>
									<button onClick={() => setEditingId(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
										<XMarkIcon className="size-5" />
									</button>
								</div>
							) : (
								<>
									<span className="font-medium text-gray-800 dark:text-gray-200 pl-2">{spec.name}</span>
									<div className="flex items-center gap-1">
										<button
											onClick={() => {
												setEditingId(spec.specialtyId);
												setEditName(spec.name);
											}}
											className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
										>
											<PencilSquareIcon className="size-5" />
										</button>
										<button
											onClick={() => handleDelete(spec.specialtyId)}
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
