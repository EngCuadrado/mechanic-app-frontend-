import clsx from "clsx";
import { useState, Fragment } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
	Transition,
} from "@headlessui/react";
import {
	EllipsisHorizontalIcon,
	InboxStackIcon,
	PlusCircleIcon,
	PencilSquareIcon
} from "@heroicons/react/24/outline";

import SimpleModal from "../../../ui/utils/SimpleModal";
import BatchTable from "../../../tables/BasicTables/BatchTable";
import AddNewBatch from "../CustomModels/AddNewBatch";
import EditMedicine from "../CustomDrawers/EditMedicine";

const showAllBatches = ({ row, onClose }: any) => {
	const { product, name } = row.original ?? [];

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={name}
			widthClass="w-[75%] h-[75%]"
			custom="h-200"
		>
			<BatchTable productId={product?.product_id} />
		</SimpleModal>
	);
};

const AddBatchModal = ({ row, onClose }: any) => {
	const { product } = row.original ?? {};
	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title="Agregar Nuevo Lote"
			widthClass="w-[50%] h-[75%]"
		>
			<AddNewBatch productId={product?.product_id} onClose={onClose} />
		</SimpleModal>
	);
};

const EditMedicineModal = ({ row, onClose}: any) => {
	const intl = useIntl();
	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "medicine.edit" })}
			widthClass="w-[50%] h-[75%]"
			custom="h-200"
		>
			<EditMedicine row={row} onClose={onClose} />
		</SimpleModal>
	); 
}

export const BatchCellActions = ({ row }: any) => {
	const [activeItem, setActiveItem] = useState<any>(null);

	const items = [
		{
			showWhen: true,
			label: (
				<>
					<PencilSquareIcon className="size-4.5 stroke-1" />
					<span>
						<FormattedMessage id="edit" values={{ count: 1 }} />
					</span>
				</>
			),
			drawer: EditMedicineModal,
		},
		{
			showWhen: true,
			label: (
				<>
					<InboxStackIcon className="size-4.5 stroke-1" />
					<span>
						<FormattedMessage id="batch" values={{ count: 2 }} />
					</span>
				</>
			),
			drawer: showAllBatches,
		},
		{
			showWhen: true,
			label: (
				<>
					<PlusCircleIcon className="size-4.5 stroke-1" />
					<span>
						<FormattedMessage id="batch.add" />
					</span>
				</>
			),
			drawer: AddBatchModal,
		},
	];

	const renderItems = items.filter((i) => i.showWhen);
	if (renderItems.length === 0) return null;

	// return <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer" />;

	return (
		<Fragment>
			<div className="flex justify-center overflow-visible z-[110]">
			<Menu as="div" className="relative inline-block text-left">
				<MenuButton className="flex items-center justify-center size-8 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
					<EllipsisHorizontalIcon className="size-5" />
				</MenuButton>
				
				<Transition
					as={MenuItems}
					enter="transition ease-out duration-100"
					enterFrom="opacity-0 translate-y-2 scale-95"
					enterTo="opacity-100 translate-y-0 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="opacity-100 translate-y-0 scale-100"
					leaveTo="opacity-0 translate-y-2 scale-95"
					className="absolute z-[100] mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg outline-none focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:shadow-none ltr:right-0 rtl:left-0 right-0"
				>
					{renderItems.map((item, index) => (
						<MenuItem as="div" key={index}>
							{({ focus }) => (
								<button
									className={clsx(
										"flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-none transition-colors",
										"text-gray-700 dark:text-gray-300",
										focus && "bg-gray-100 !text-gray-900 dark:bg-gray-700 dark:!text-white"
									)}
									onClick={() => setActiveItem(item)}
								>
									{item.label}
								</button>
							)}
						</MenuItem>
					))}
				</Transition>
			</Menu>
			</div>
			{activeItem && (
				<activeItem.drawer
					row={row}
					onClose={() => setActiveItem(null)}
				/>
			)}
		</Fragment>
	);
};
