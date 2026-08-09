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
import EditAdministrationRoute from "../CustomDrawers/EditAdministrationRoute";

const UPDATE_ADMINISTRATION_ROUTE_MUTATION = gql`
	mutation UpdateAdministrationRoute(
		$id: Int!
		$name: String!
		$description: String!
		$is_active: Boolean!
	) {
		updateAdministrationRoute(
			id: $id
			name: $name
			description: $description
			is_active: $is_active
		) {
			administration_route_id
			name
			description
			is_active
		}
	}
`;

interface AdministrationRouteData {
	administration_route_id: string | number;
	name: string;
	description?: string;
	is_active?: boolean;
}

interface EditAdministrationRouteDrawerProps {
	row: {
		original: AdministrationRouteData;
	};
	onClose: () => void;
}

interface ToggleActivatedModalProps {
	row: {
		original: AdministrationRouteData;
	};
	onClose: () => void;
}

interface SetStatusLevelProps {
	is_active: boolean | null | undefined;
}

interface MenuItem {
	showWhen: boolean;
	label: React.ReactNode;
	drawer: React.ComponentType<{
		row: { original: AdministrationRouteData };
		onClose: () => void;
	}>;
}

interface AdministrationRouteCellActionsProps {
	row: {
		original: AdministrationRouteData;
	};
}

const EditAdministrationRouteDrawer = ({
	row,
	onClose,
}: EditAdministrationRouteDrawerProps) => {
	const intl = useIntl();

	return (
		<CellWithDrawer
			isOpen={true}
			onClose={onClose}
			title={intl.formatMessage({ id: "administration_route.edit" })}
			widthClass="w-150"
		>
			<EditAdministrationRoute row={row} onClose={onClose} />
		</CellWithDrawer>
	);
};

const ToggleActivatedModal = ({ row, onClose }: ToggleActivatedModalProps) => {
	const intl = useIntl();
	const { administration_route_id, is_active, name, description } =
		row.original;

	const [updateStatus, { loading }] = useMutation(
		UPDATE_ADMINISTRATION_ROUTE_MUTATION,
		{
			refetchQueries: ["GetAdministrationRoutes"],
			onCompleted: () => onClose(),
		}
	);

	const handleConfirm = () => {
		updateStatus({
			variables: {
				id: parseInt(String(administration_route_id), 10),
				name: name || "",
				description: description || "",
				is_active: !is_active,
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
						loading && "opacity-70 cursor-not-allowed"
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

export const AdministrationRouteCellActions = ({
	row,
}: AdministrationRouteCellActionsProps) => {
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
			drawer: EditAdministrationRouteDrawer,
		},
		{
			showWhen: true,
			label: <SetStatusLevel is_active={is_active} />,
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
