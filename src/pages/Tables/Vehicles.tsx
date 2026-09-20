import { useState } from "react";
import { useIntl } from "react-intl";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { ServerDataTable } from "../../components/ui/table/ServerDataTable";
import { useVehicleColumns } from "../../components/ui/table/ColumnsDefinitions";
import { GET_VEHICLES_QUERY } from "../../components/ui/table/QuerysDefinitions";
import SimpleModal from "../../components/ui/utils/SimpleModal";
import AddNewVehicle from "../../components/ui/table/CustomDrawers/AddNewVehicle";

const AddNewVehicleModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <SimpleModal
            isOpen={true}
            onClose={onClose}
            title="Agregar Vehículo"
            widthClass="w-full max-w-md md:max-w-2xl"
            disableOutsideClick={true}
        >
            <AddNewVehicle onClose={onClose} />
        </SimpleModal>
    );
};

export default function Vehicles() {
    const intl = useIntl();
    const [showModal, setShowModal] = useState<boolean>(false);

    const query = GET_VEHICLES_QUERY();
    const columns = useVehicleColumns();

    return (
        <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
                <PageBreadcrumb
                    pageTitle="Vehículos"
                />
            </div>

            <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 mb-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 text-white rounded-xl transition-colors flex items-center gap-2 bg-brand-500 hover:bg-brand-600 cursor-pointer"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        Agregar Vehículo
                    </button>
                </div>

                <div>
                    <ServerDataTable
                        columns={columns}
                        query={query}
                        queryKeyName="vehicles"
                    />
                </div>
            </div>

            {showModal && (
                <AddNewVehicleModal onClose={() => setShowModal(false)} />
            )}
        </div>
    );
}
