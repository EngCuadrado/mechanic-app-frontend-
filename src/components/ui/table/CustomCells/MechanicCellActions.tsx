import clsx from "clsx";
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

import SimpleModal from "../../../ui/utils/SimpleModal";
import EditMechanic from "../CustomDrawers/EditMechanic";
import { TOGGLE_MECHANIC_STATUS_MUTATION, GET_MECHANICS_QUERY } from "../QuerysDefinitions";

interface MechanicData {
	mechanicId: string | number;
	firstName: string;
	lastName: string;
	isActive: boolean;
	specialty: {
		specialtyId: number;
		name: string;
	};
}

interface EditMechanicModalProps {
	row: { original: MechanicData };
	onClose: () => void;
}

interface ToggleActivatedModalProps {
	row: { original: MechanicData };
	onClose: () => void;
}

interface SetStatusLevelProps {
	isActive: boolean | null | undefined;
}

interface MenuItemProps {
	showWhen: boolean;
	label: React.ReactNode;
	drawer: React.ComponentType<{ row: { original: MechanicData }; onClose: () => void }>;
}

interface MechanicCellActionsProps {
	row: {
		original: MechanicData;
	};
}

const EditMechanicModal = ({ row, onClose }: EditMechanicModalProps) => {
	const intl = useIntl();

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "mechanic.edit", defaultMessage: "Editar Mecánico" })}
			widthClass="w-full max-w-lg md:max-w-2xl"
			disableOutsideClick={true}
		>
			<EditMechanic row={row} onClose={onClose} />
		</SimpleModal>
	);
};

const ToggleActivatedModal = ({ row, onClose }: ToggleActivatedModalProps) => {
	const intl = useIntl();
	const { mechanicId, isActive, firstName, lastName } = row.original;

	const [toggleStatus, { loading }] = useMutation(
		TOGGLE_MECHANIC_STATUS_MUTATION,
		{
			refetchQueries: [{ query: GET_MECHANICS_QUERY() }],
			onCompleted: () => onClose(),
		},
	);

	const handleConfirm = () => {
		toggleStatus({
			variables: {
				mechanicId: parseInt(String(mechanicId)),
			},
		});
	};

	return (
		<SimpleModal
			isOpen={true}
			onClose={onClose}
			title={
				intl.formatMessage({
					id: isActive ? "deactivate" : "activate",
				}) + ` ${firstName} ${lastName}`
			}
		>
			<p>{intl.formatMessage({ id: "confirm_action_message" })}</p>

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
						isActive
							? "bg-red-600 hover:bg-red-700"
							: "bg-green-600 hover:bg-green-700",
						loading && "opacity-70 cursor-not-allowed",
					)}
				>
					{loading ? (
						<span>
							<FormattedMessage id="common.processing" defaultMessage="Procesando..." />
						</span>
					) : isActive ? (
						<FormattedMessage id="deactivate" defaultMessage="Desactivar" />
					) : (
						<FormattedMessage id="activate" defaultMessage="Activar" />
					)}
				</button>
			</div>
		</SimpleModal>
	);
};

const SetStatusLevel = ({ isActive }: SetStatusLevelProps) => {
	return isActive ? (
		<Fragment>
			<span className="text-red-600 flex items-center gap-2">
				<MinusCircleIcon className="size-4.5 stroke-1" />
				<FormattedMessage id="deactivate" defaultMessage="Desactivar" />
			</span>
		</Fragment>
	) : (
		<Fragment>
			<span className="text-green-600 flex items-center gap-2">
				<CheckCircleIcon className="size-4.5 stroke-1" />
				<FormattedMessage id="activate" defaultMessage="Activar" />
			</span>
		</Fragment>
	);
};

export const MechanicCellActions = ({ row }: MechanicCellActionsProps) => {
	const { original } = row;
	const { isActive } = original;
	const [activeItem, setActiveItem] = useState<MenuItemProps | null>(null);

	const items: MenuItemProps[] = [
		{
			showWhen: true,
			label: (
				<Fragment>
					<PencilSquareIcon className="size-4.5 stroke-1" />
					<span>
						<FormattedMessage id="edit" defaultMessage="Editar" />
					</span>
				</Fragment>
			),
			drawer: EditMechanicModal,
		},
		{
			showWhen: true,
			label: <SetStatusLevel isActive={isActive} />,
			drawer: ToggleActivatedModal,
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
