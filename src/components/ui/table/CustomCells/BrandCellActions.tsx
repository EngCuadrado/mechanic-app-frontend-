import clsx from "clsx";
import { gql } from "@apollo/client";
import { useState, Fragment } from "react";
import { useMutation } from "@apollo/client/react";
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
	MinusCircleIcon,
	CheckCircleIcon,
} from "@heroicons/react/24/outline";

import CellWithDrawer from "../CellWithDrawer";
import SimpleModal from "../../../ui/utils/SimpleModal";
import EditBrand from "../CustomDrawers/EditBrand";

const TOGGLE_BRAND_STATUS_MUTATION = gql`
	mutation ToggleBrandStatus($id_brand: Int!) {
		toggleBrandStatus(id_brand: $id_brand) {
			id_brand
			name
			is_active
		}
	}
`;

interface BrandData {
	id_brand: string | number;
	name: string;
	contact_phone?: string;
	contact_email?: string;
	logo_url?: string;
	is_active?: boolean;
}

interface EditBrandDrawerProps {
	row: {
		original: BrandData;
	};
	onClose: () => void;
}

interface ToggleActivatedModalProps {
	row: {
		original: BrandData;
	};
	onClose: () => void;
}

interface SetStatusLevelProps {
	is_active: boolean | null | undefined;
}

interface MenuItem {
	showWhen: boolean;
	label: React.ReactNode;
	drawer: React.ComponentType<{ row: { original: BrandData }; onClose: () => void }>;
}

interface BrandCellActionsProps {
	row: {
		original: BrandData;
	};
}

const EditBrandDrawer = ({ row, onClose }: EditBrandDrawerProps) => {
	const intl = useIntl();

	return (
		<CellWithDrawer
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "brand.edit" })}
			widthClass="w-150"
		>
			<EditBrand row={row} onClose={onClose} />
		</CellWithDrawer>
	);
};

const ToggleActivatedModal = ({ row, onClose }: ToggleActivatedModalProps) => {
	const intl = useIntl();
	// Asegurarse de extraer id_brand
	const { id_brand, is_active, name } = row.original;

	// 3. CONFIGURAR EL HOOK useMutation
	const [toggleStatus, { loading }] = useMutation(
		TOGGLE_BRAND_STATUS_MUTATION,
		{
			// Solo necesitas pasar el nombre del query o el objeto gql
			refetchQueries: ["GetBrands"],
			onCompleted: () => onClose(),
		},
	);

	const handleConfirm = () => {
		toggleStatus({
			variables: {
				id_brand: parseInt(id_brand), // Asegurar que sea entero según tu schema
			},
		});
	};

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={
				intl.formatMessage({
					id: is_active ? "deactivate" : "activate",
				}) + ` ${name}`
			}
		>
			<p>{intl.formatMessage({ id: "confirm_action_message" })}</p>

			{/* {error && (
        <p className="text-red-500 text-sm mt-2">Error: {error.message}</p>
      )} */}

			<div className="mt-6 flex justify-end gap-3">
				<button
					onClick={onClose}
					className="px-4 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 disabled:opacity-50"
					disabled={loading}
				>
					<FormattedMessage id="cancel" defaultMessage="Cancelar" />
				</button>

				<button
					onClick={handleConfirm}
					disabled={loading}
					className={clsx(
						"px-4 py-2 text-white rounded transition-colors flex items-center gap-2",
						is_active
							? "bg-red-600 hover:bg-red-700"
							: "bg-green-600 hover:bg-green-700",
						loading && "opacity-70 cursor-not-allowed",
					)}
				>
					{loading ? (
						<span>
							<FormattedMessage id="common.processing" />
						</span>
					) : is_active ? (
						<FormattedMessage id="deactivate" />
					) : (
						<FormattedMessage id="activate" />
					)}
				</button>
			</div>
		</SimpleModal>
	);
};

const SetStatusLevel = ({ is_active }: SetStatusLevelProps) => {
	return is_active ? (
		<Fragment>
			<span className="text-red-600 flex items-center gap-2">
				<MinusCircleIcon className="size-4.5 stroke-1" />
				<FormattedMessage id="deactivate" />
			</span>
		</Fragment>
	) : (
		<Fragment>
			<span className="text-green-600 flex items-center gap-2">
				<CheckCircleIcon className="size-4.5 stroke-1" />
				<FormattedMessage id="activate" />
			</span>
		</Fragment>
	);
};

export const BrandCellActions = ({ row }: BrandCellActionsProps) => {
	const { original } = row;
	const { is_active } = original;
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
			drawer: EditBrandDrawer,
		},
		{
			showWhen: true,
			label: <SetStatusLevel is_active={is_active} />,
			drawer: ToggleActivatedModal,
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
