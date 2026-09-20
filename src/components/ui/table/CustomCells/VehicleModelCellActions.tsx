import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation } from "@apollo/client/react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

import SimpleModal from "../../utils/SimpleModal";
import { DELETE_VEHICLE_MODEL_MUTATION, GET_VEHICLE_MODELS_QUERY } from "../QuerysDefinitions";
import EditVehicleModel from "../CustomDrawers/EditVehicleModel";

const EditVehicleModelModal = ({ row, onClose }: any) => {
	const intl = useIntl();

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "model.edit", defaultMessage: "Editar Modelo" })}
			widthClass="w-full max-w-lg md:max-w-2xl"
			disableOutsideClick={true}
		>
			<div>
				<EditVehicleModel row={row} onClose={onClose} />
			</div>
		</SimpleModal>
	);
};

export const VehicleModelCellActions = ({ row }: any) => {
	const intl = useIntl();
	const [showEditModal, setShowEditModal] = useState(false);

	const [deleteFunction, { loading: deleting }] = useMutation(DELETE_VEHICLE_MODEL_MUTATION, {
		refetchQueries: [{ query: GET_VEHICLE_MODELS_QUERY() }],
	});

	const handleDelete = async () => {
		if (window.confirm(intl.formatMessage({ id: "model.delete.confirm", defaultMessage: "¿Seguro que deseas eliminar este modelo?" }))) {
			try {
				await deleteFunction({ variables: { modelId: Number(row.original.modelId) } });
				toast.success(intl.formatMessage({ id: "model.delete.success", defaultMessage: "Modelo eliminado" }));
			} catch (e: any) {
				toast.error(e.message || "Error al eliminar");
			}
		}
	};

	return (
		<div className="flex items-center gap-2">
			<button
				onClick={() => setShowEditModal(true)}
				className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
				title={intl.formatMessage({ id: "edit", defaultMessage: "Editar" })}
			>
				<PencilSquareIcon className="size-5" />
			</button>
			<button
				onClick={handleDelete}
				disabled={deleting}
				className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
				title={intl.formatMessage({ id: "delete", defaultMessage: "Eliminar" })}
			>
				<TrashIcon className="size-5" />
			</button>

			{showEditModal && (
				<EditVehicleModelModal row={row} onClose={() => setShowEditModal(false)} />
			)}
		</div>
	);
};
