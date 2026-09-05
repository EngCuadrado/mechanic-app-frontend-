import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { ServerDataTable } from "../../components/ui/table/ServerDataTable";
import { useInventoryColumns } from "../../components/ui/table/ColumnsDefinitions";
import { GET_INVENTORY_PARTS_QUERY } from "../../components/ui/table/QuerysDefinitions";
import SimpleModal from "../../components/ui/utils/SimpleModal";
import AddNewInventoryPart from "../../components/ui/table/CustomDrawers/AddNewInventoryPart";

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

const AddNewInventoryModal = ({ onClose }: { onClose: () => void }) => {
	const intl = useIntl();

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "inventory.add", defaultMessage: "Agregar Producto" })}
			widthClass="w-full max-w-lg md:max-w-2xl lg:max-w-3xl"
			disableOutsideClick={true}
		>
			<AddNewInventoryPart onClose={onClose} />
		</SimpleModal>
	);
};

export default function Inventory() {
    const intl = useIntl();
    const [showModal, setShowModal] = useState<boolean>(false);

    const query = GET_INVENTORY_PARTS_QUERY();
    const columns = useInventoryColumns();

    return (
        <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
                <PageBreadcrumb
                    pageTitle={intl.formatMessage(
                        { id: "inventory" }
                    )}
                />
            </div>

            <div className="flex-1">
                <div id="tour-actions" className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 mb-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 text-white rounded-xl transition-colors flex items-center gap-2 bg-brand-500 cursor-pointer"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        <FormattedMessage id="inventory.add" defaultMessage="Agregar Producto" />
                    </button>
                </div>

                <div>
                    <ServerDataTable
                        columns={columns}
                        query={query}
                        queryKeyName="inventoryParts"
                    />
                </div>
            </div>

            {showModal && (
                <AddNewInventoryModal onClose={() => setShowModal(false)} />
            )}
        </div>
    );
}
