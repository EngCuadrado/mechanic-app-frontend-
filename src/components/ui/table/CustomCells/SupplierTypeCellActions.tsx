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
	PencilSquareIcon,
} from "@heroicons/react/24/outline";

import CellWithDrawer from "../CellWithDrawer";
import EditSupplierType from "../CustomDrawers/EditSupplierType";

interface SupplierTypeData {
	supplier_type_id: string | number;
	type_name: string;
	description?: string;
}

interface EditSupplierTypeDrawerProps {
	row: {
		original: SupplierTypeData;
	};
	onClose: () => void;
}

interface MenuItem {
	showWhen: boolean;
	label: React.ReactNode;
	drawer: React.ComponentType<{
		row: { original: SupplierTypeData };
		onClose: () => void;
	}>;
}

interface SupplierTypeCellActionsProps {
	row: {
		original: SupplierTypeData;
	};
}

const EditSupplierTypeDrawer = ({
	row,
	onClose,
}: EditSupplierTypeDrawerProps) => {
	const intl = useIntl();

	return (
		<CellWithDrawer
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "supplier_type.edit" })}
			widthClass="w-150"
		>
			<EditSupplierType row={row} onClose={onClose} />
		</CellWithDrawer>
	);
};

export const SupplierTypeCellActions = ({
	row,
}: SupplierTypeCellActionsProps) => {
	const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

	const items = [
		{
			showWhen: true,
			label: (
				<Fragment>
					<PencilSquareIcon className="size-4.5 stroke-1" />
					<span>
						<FormattedMessage id="edit" />
					</span>
				</Fragment>
			),
			drawer: EditSupplierTypeDrawer,
		},
	];

	const renderItems = items.filter((i) => i.showWhen);
	if (renderItems.length === 0) return null;

	return (
		<Fragment>
			<div className="flex justify-center overflow-visible z-[110]">
				<Menu as="div" className="relative inline-block text-left">
					<MenuButton className="flex items-center justify-center size-8 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
						<EllipsisHorizontalIcon className="size-5" />
					</MenuButton>

					<Transition
						as={Fragment}
						enter="transition ease-out duration-100"
						enterFrom="opacity-0 translate-y-2 scale-95"
						enterTo="opacity-100 translate-y-0 scale-100"
						leave="transition ease-in duration-75"
						leaveFrom="opacity-100 translate-y-0 scale-100"
						leaveTo="opacity-0 translate-y-2 scale-95"
					>
						<MenuItems className="absolute z-[100] mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg outline-none focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:shadow-none ltr:right-0 rtl:left-0 right-0">
							{renderItems.map((item, index) => (
								<MenuItem as="div" key={index}>
									{({ focus }) => (
										<button
											className={clsx(
												"flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-none transition-colors",
												"text-gray-700 dark:text-gray-300",
												focus &&
													"bg-gray-100 !text-gray-900 dark:bg-gray-700 dark:!text-white"
											)}
											onClick={() => setActiveItem(item)}
										>
											{item.label}
										</button>
									)}
								</MenuItem>
							))}
						</MenuItems>
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
