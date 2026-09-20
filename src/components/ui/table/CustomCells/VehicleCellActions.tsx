import { useState } from "react";
import { useIntl } from "react-intl";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

import SimpleModal from "../../../ui/utils/SimpleModal";
import EditVehicle from "../CustomDrawers/EditVehicle";

interface VehicleData {
    vehicleId: number;
    plate: string;
    vin?: string;
    chassisNumber?: string;
    year?: number;
    currentMilage?: number;
    nextMaintenanceDate?: string;
    nextMaintenanceMilage?: number;
    insuranceExpirationDate?: string;
    mechanicalInspectionExpiration?: string;
    emissionsInspectionExpiration?: string;
    status?: string;
    companyId?: number;
    modelId?: number;
    company?: {
        companyId?: number;
        name?: string;
    };
    model?: {
        modelId?: number;
        modelName?: string;
        brand?: {
            brandName?: string;
        };
    };
}

interface EditVehicleDrawerProps {
	row: {
		original: VehicleData;
	};
	onClose: () => void;
}

interface VehicleCellActionsProps {
	row: {
		original: VehicleData;
	};
}

const EditVehicleModal = ({ row, onClose }: EditVehicleDrawerProps) => {
	const intl = useIntl();

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "vehicle.form.update" })}
			widthClass="w-full max-w-md md:max-w-2xl"
            disableOutsideClick={true}
		>
			<EditVehicle row={row.original} onClose={onClose} />
		</SimpleModal>
	);
};

export const VehicleCellActions = ({ row }: VehicleCellActionsProps) => {
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	return (
		<div className="flex items-center justify-end">
			<button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Editar Vehículo"
            >
                <PencilSquareIcon className="size-5 stroke-1 text-gray-500 dark:text-gray-400" />
            </button>

			{isEditModalOpen && (
				<EditVehicleModal
					row={row}
					onClose={() => setIsEditModalOpen(false)}
				/>
			)}
		</div>
	);
};
