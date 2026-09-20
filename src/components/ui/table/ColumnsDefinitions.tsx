import { useMemo } from "react";
import { Avatar } from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { useIntl } from "react-intl";

import Stock from "./CustomCells/Stock";
import Status from "./CustomCells/Status";
import MedicineName from "./CustomCells/MedicineName";
import { BatchStock } from "./CustomCells/BatchStock";
import { stringAvatar } from "../../../utils/AvatarUtils";
import BatchExpiration from "./CustomCells/ExpirationDate";
import { BrandCellActions } from "./CustomCells/BrandCellActions";
import { VehicleCellActions } from "./CustomCells/VehicleCellActions";
import { CategoryCellActions } from "./CustomCells/CategoryCellActions";
import { ActiveIngredientCellActions } from "./CustomCells/ActiveIngredientCellActions";
import { AdministrationRouteCellActions } from "./CustomCells/AdministrationRouteCellActions";
import { SupplierTypeCellActions } from "./CustomCells/SupplierTypeCellActions";
import { SupplierCellActions } from "./CustomCells/SupplierCellActions";
import { BatchCellActions } from "./CustomCells/BatchCellActions";
import { MechanicCellActions } from "./CustomCells/MechanicCellActions";
import { CompanyCellActions } from "./CustomCells/CompanyCellActions";
import MedicineClasification from "./CustomCells/MedicineClasification";
import { EmployeeCellActions } from "../table/CustomCells/EmployeeCellActions";
import MedicineActiveIngredients from "./CustomCells/MedicineActiveIngredients";
import TransactionDate from "./CustomCells/TransactionDate";
import TransactionPay from "./CustomCells/TransactionPay";
import TransactionMedicine from "./CustomCells/TransactionMedicine";
import TransactionEmployee from "./CustomCells/TransactionEmployee";
import { BatchTableActions } from "./CustomCells/BatchTableActions";
import { InventoryPartCellActions } from "./CustomCells/InventoryPartCellActions";
import { InventoryPartProductInfo } from "./CustomCells/InventoryPartProductInfo";
import { FaBox } from "react-icons/fa6";

import {
	IdentificationIcon,
	UserIcon,
	PhoneIcon,
	EnvelopeIcon,
	GlobeAltIcon,
	MapPinIcon,
	Squares2X2Icon,
	BeakerIcon,
	TruckIcon,
} from "@heroicons/react/24/outline";

import {
	TbPill,
	TbVaccine,
	TbLungs,
	TbDroplet,
	TbBandage,
} from "react-icons/tb";
import { MdOutlineMedicalServices } from "react-icons/md";

import { FaUserDoctor } from "react-icons/fa6";
import { RiReceiptLine } from "react-icons/ri";

const ROUTE_FAMILY_ICONS = {
	Enteral: TbPill,
	Parenteral: TbVaccine,
	Respiratoria: TbLungs,
	LocalGotas: TbDroplet,
	Topica: TbBandage,
	Otra: MdOutlineMedicalServices,
};

const getRouteIcon = (routeName: string) => {
	const name = routeName?.toLowerCase() || "";
	if (
		name.includes("intra") ||
		name.includes("subcutánea") ||
		name.includes("epidural") ||
		name.includes("peridural") ||
		name.includes("retrobulbar") ||
		name.includes("peribulbar")
	) {
		return ROUTE_FAMILY_ICONS.Parenteral;
	}
	if (
		name.includes("oral") ||
		name.includes("sublingual") ||
		name.includes("bucal") ||
		name.includes("gástrica") ||
		name.includes("yeyunostomía") ||
		name.includes("rectal")
	) {
		return ROUTE_FAMILY_ICONS.Enteral;
	}
	if (
		name.includes("inhal") ||
		name.includes("endotraqueal") ||
		name.includes("nasal")
	) {
		return ROUTE_FAMILY_ICONS.Respiratoria;
	}
	if (
		name.includes("oftálmica") ||
		name.includes("ótica") ||
		name.includes("conjuntival")
	) {
		return ROUTE_FAMILY_ICONS.LocalGotas;
	}
	if (
		name.includes("tópica") ||
		name.includes("transdérmica") ||
		name.includes("vaginal") ||
		name.includes("uretral")
	) {
		return ROUTE_FAMILY_ICONS.Topica;
	}
	return ROUTE_FAMILY_ICONS.Otra;
};

export const useEmployeeColumns = () => {
	const intl = useIntl();

	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				// Usamos intl.formatMessage para obtener un string puro,
				// lo cual evita errores de tipo en 'header'
				header: intl.formatMessage({ id: "names" }, { count: 2 }),
				accessorFn: (row) => `${row.names} ${row.lastnames}`,
				id: "names",
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<Avatar
							{...stringAvatar({
								name: row.original.names,
								size: 30,
							})}
						/>
						<span className="text-sm font-medium">
							{row.original.names} {row.original.lastnames}
						</span>
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "email" }),
				accessorKey: "email",
				id: "email",
				cell: ({ getValue }) => (
					<span className="text-sm">{getValue() as string}</span>
				),
			},
			{
				header: intl.formatMessage({ id: "user" }),
				accessorKey: "user",
				id: "user",
				cell: ({ getValue }) => (
					<span className="text-sm font-medium">
						{getValue() as string}
					</span>
				),
			},
			{
				header: intl.formatMessage({ id: "role" }),
				accessorKey: "roleName.name",
                id: "roleName.name",
				enableSorting: true,
				cell: ({ getValue }) => (
					<span className="text-sm">{getValue() as string}</span>
				),
			},
			{
				header: intl.formatMessage({ id: "statuses" }),
				accessorKey: "employeeStatusId",
				enableSorting: false,
				cell: ({ row }) => {
					const isActive = row.original.employeeStatusId === 1;
					return <Status status={isActive} />;
				},
			},
			{
				header: intl.formatMessage({ id: "actions" }),
				id: "actions",
				cell: ({ row }) => <EmployeeCellActions row={row} />,
			},
		],
		[intl],
	); // intl es la dependencia

	return columns;
};

export const useBrandColumns = () => {
	const intl = useIntl();
	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "brands" }, { count: 1 }),
				id: "brand_info",
				cell: ({ row }) => (
					<div className="flex items-center gap-4">
						{row.original.logo_url ? (
							<div className="w-10 h-10 flex-shrink-0 bg-gray-50 dark:bg-dark-800 rounded-lg p-1 border border-gray-100 dark:border-dark-700">
								<img
									src={row.original.logo_url}
									alt={row.original.name}
									className="w-full h-full object-contain"
								/>
							</div>
						) : (
							<div className="w-10 h-10 flex-shrink-0 bg-gray-100 dark:bg-dark-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-dark-600">
								<span className="text-sm font-bold text-gray-400">
									{row.original.name.charAt(0).toUpperCase()}
								</span>
							</div>
						)}
						<span className="text-base font-semibold text-gray-800 dark:text-gray-100">
							{row.original.name}
						</span>
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "contact" }),
				id: "contact_info",
				cell: ({ row }) => (
					<div className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
						{row.original.contact_phone && (
							<div className="flex items-center gap-2">
								<PhoneIcon className="size-3.5 text-gray-400" />
								{row.original.contact_phone}
							</div>
						)}
						{row.original.contact_email && (
							<div className="flex items-center gap-2">
								<EnvelopeIcon className="size-3.5 text-gray-400" />
								<span
									className="truncate max-w-[180px]"
									data-tooltip-id="global-tooltip"
									data-tooltip-content={
										row.original.contact_email
									}
								>
									{row.original.contact_email}
								</span>
							</div>
						)}
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "statuses" }),
				accessorKey: "is_active",
				cell: ({ getValue }) => (
					<Status status={getValue() ? true : false} />
				),
			},
			{
				id: "actions",
				cell: ({ row }) => <BrandCellActions row={row} />,
			},
		],
		[intl],
	);

	return columns;
};

export const useCategoryColumns = () => {
	const intl = useIntl();
	const columns = useMemo<ColumnDef<unknown>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "name" }),
				id: "name",
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<Squares2X2Icon className="size-5 text-gray-400 flex-shrink-0" />
						<span className="text-base font-semibold text-gray-800 dark:text-gray-100">
							{row.original.name}
						</span>
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "description" }),
				accessorKey: "description",
				id: "description",
				cell: ({ getValue }) => (
					<span className="text-sm text-gray-600 dark:text-gray-400 font-medium line-clamp-2 max-w-[400px]">
						{getValue() as string}
					</span>
				),
			},
			{
				header: intl.formatMessage({ id: "status" }),
				accessorKey: "is_active",
				cell: ({ getValue }) => (
					<Status status={getValue() ? true : false} />
				),
			},
			{
				id: "actions",
				cell: ({ row }) => <CategoryCellActions row={row} />,
			},
		],
		[intl],
	);

	return columns;
};

export const useActiveIngredientsColumns = () => {
	const intl = useIntl();
	const columns = useMemo<ColumnDef<unknown>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "name" }),
				id: "name",
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<BeakerIcon className="size-5 text-gray-400 flex-shrink-0" />
						<span className="text-base font-semibold text-gray-800 dark:text-gray-100">
							{row.original.name}
						</span>
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "description" }),
				accessorKey: "description",
				id: "description",
				cell: ({ getValue }) => (
					<span className="text-sm text-gray-600 dark:text-gray-400 font-medium line-clamp-2 max-w-[400px]">
						{getValue() as string}
					</span>
				),
			},
			{
				header: intl.formatMessage({ id: "status" }),
				accessorKey: "is_active",
				cell: ({ getValue }) => (
					<Status status={getValue() ? true : false} />
				),
			},
			{
				id: "actions",
				cell: ({ row }) => <ActiveIngredientCellActions row={row} />,
			},
		],
		[intl],
	);

	return columns;
};

export const useAdministrationRoutesColumns = () => {
	const intl = useIntl();
	const columns = useMemo<ColumnDef<unknown>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "name" }),
				id: "name",
				cell: ({ row }) => {
					const IconComponent = getRouteIcon(row.original.name);
					return (
						<div className="flex items-center gap-3">
							<IconComponent className="size-5 text-gray-400 flex-shrink-0" />
							<span className="text-base font-semibold text-gray-800 dark:text-gray-100">
								{row.original.name}
							</span>
						</div>
					);
				},
			},
			{
				header: intl.formatMessage({ id: "description" }),
				accessorKey: "description",
				id: "description",
				cell: ({ getValue }) => (
					<span className="text-sm text-gray-600 dark:text-gray-400 font-medium line-clamp-2 max-w-[400px]">
						{getValue() as string}
					</span>
				),
			},
			{
				header: intl.formatMessage({ id: "status" }),
				accessorKey: "is_active",
				cell: ({ getValue }) => (
					<Status status={getValue() ? true : false} />
				),
			},
			{
				id: "actions",
				cell: ({ row }) => <AdministrationRouteCellActions row={row} />,
			},
		],
		[intl],
	);

	return columns;
};

export const useSupplierTypesColumns = () => {
	const intl = useIntl();
	const columns = useMemo<ColumnDef<unknown>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "name" }),
				id: "name",
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<TruckIcon className="size-5 text-gray-400 flex-shrink-0" />
						<span className="text-base font-semibold text-gray-800 dark:text-gray-100">
							{row.original.type_name}
						</span>
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "description" }),
				accessorKey: "description",
				id: "description",
				cell: ({ getValue }) => (
					<span className="text-sm text-gray-600 dark:text-gray-400 font-medium line-clamp-2 max-w-[400px]">
						{getValue() as string}
					</span>
				),
			},
			{
				id: "actions",
				cell: ({ row }) => <SupplierTypeCellActions row={row} />,
			},
		],
		[intl],
	);

	return columns;
};

export const useSupplierColumns = () => {
	const intl = useIntl();
	const columns = useMemo<ColumnDef<unknown>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "supplier" }),
				id: "supplier_info",
				cell: ({ row }) => (
					<div className="flex flex-col">
						<span className="text-base font-semibold text-gray-800 dark:text-gray-100">
							{row.original.company_name}
						</span>
						<div className="flex items-center gap-2 mt-1">
							{row.original.tax_id && (
								<span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium">
									<IdentificationIcon className="size-3.5" />
									{row.original.tax_id}
								</span>
							)}
							{row.original.type?.type_name && (
								<span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10">
									{row.original.type.type_name}
								</span>
							)}
						</div>
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "contact" }),
				id: "contact_info",
				cell: ({ row }) => (
					<div className="flex flex-col gap-1">
						{row.original.contact_name && (
							<div className="flex items-center gap-2 text-base text-gray-800 dark:text-gray-200 font-semibold">
								<UserIcon className="size-4 text-gray-500" />
								{row.original.contact_name}
							</div>
						)}
						<div className="flex flex-col text-sm text-gray-700 dark:text-gray-300 font-medium">
							{row.original.phone && (
								<div className="flex items-center gap-2">
									<PhoneIcon className="size-3.5 text-gray-500" />
									{row.original.phone}
								</div>
							)}
							{row.original.email && (
								<div className="flex items-center gap-2 mt-0.5">
									<EnvelopeIcon className="size-3.5 text-gray-500" />
									<span
										className="truncate max-w-[150px]"
										data-tooltip-id="global-tooltip"
										data-tooltip-content={
											row.original.email
										}
									>
										{row.original.email}
									</span>
								</div>
							)}
						</div>
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "details" }),
				id: "location_info",
				cell: ({ row }) => (
					<div className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300 font-medium">
						{row.original.address && (
							<div className="flex items-start gap-2">
								<MapPinIcon className="size-4 mt-0.5 text-gray-500 shrink-0" />
								<span
									className="line-clamp-2 max-w-[200px]"
									data-tooltip-id="global-tooltip"
									data-tooltip-content={row.original.address}
								>
									{row.original.address}
								</span>
							</div>
						)}
						{row.original.website && (
							<div className="flex items-center gap-2">
								<GlobeAltIcon className="size-4 text-gray-500 shrink-0" />
								<a
									href={
										row.original.website.startsWith("http")
											? row.original.website
											: `https://${row.original.website}`
									}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-700 dark:text-blue-400 hover:underline font-semibold truncate max-w-[150px]"
								>
									{row.original.website.replace(
										/^https?:\/\//,
										"",
									)}
								</a>
							</div>
						)}
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "status" }),
				accessorKey: "is_active",
				cell: ({ getValue }) => (
					<Status status={getValue() ? true : false} />
				),
			},
			{
				id: "actions",
				cell: ({ row }) => <SupplierCellActions row={row} />,
			},
		],
		[intl],
	);

	return columns;
};

export const useMedicineColumns = () => {
	const intl = useIntl();
	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "name" }),
				id: "name",
				cell: ({ row }) => <MedicineName row={row} />,
			},
			{
				header: intl.formatMessage(
					{ id: "clasification" },
					{ count: 1 },
				),
				id: "medicineClasification",
				cell: ({ row }) => <MedicineClasification row={row} />,
			},
			{
				header: intl.formatMessage(
					{ id: "active_ingredients" },
					{ count: 1 },
				),
				id: "medicineActiveIngredients",
				cell: ({ row }) => <MedicineActiveIngredients row={row} />,
			},
			{
				header: intl.formatMessage({ id: "stock" }),
				id: "product",
				cell: ({ row }) => <Stock row={row} />,
			},
			{
				header: intl.formatMessage({ id: "prices" }),
				id: "prices",
				cell: ({ row }) => {
					const unitPrice = row.original.product?.price_per_unit || 0;
					const fullPrice =
						row.original.product?.price_full_presentation || 0;

					if (unitPrice > 0) {
						return (
							<div className="flex items-center gap-2 w-30">
								<span>C$ {unitPrice.toFixed(2)}</span>
								{fullPrice > 0 && (
									<div
										className="cursor-help text-orange-500 p-2 rounded-full bg-orange-100"
										data-tooltip-id="global-tooltip"
										data-tooltip-content={`${intl.formatMessage({ id: "price_full_presentation" })}: C$ ${fullPrice.toFixed(2)}`}
									>
										<FaBox className="size-3" />
									</div>
								)}
							</div>
						);
					}

					return <span>C$ {fullPrice.toFixed(2)}</span>;
				},
			},
			{
				header: intl.formatMessage({ id: "description" }),
				// accessorKey: "description",
				id: "description",
				cell: ({ row }) => {
					const description = row.original.description;
					return <div className="max-w-70">{description}</div>;
				},
			},
			{
				header: intl.formatMessage({ id: "actions" }),
				id: "actions",
				cell: ({ row }) => <BatchCellActions row={row} />,
			},
		],
		[intl],
	);

	return columns;
};

export const useBatchColumns = () => {
	const intl = useIntl();
	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "status" }),
				id: "is_active",
				cell: ({ row }) => {
					const isActive = row.original.is_active;
					return (
						<div className="flex items-center justify-center">
							<Status status={isActive} />
						</div>
					);
				},
			},
			{
				header: intl.formatMessage({ id: "code" }),
				accessorKey: "batch_code",
				id: "batch_code",
			},
			{
				header: intl.formatMessage({ id: "exp_date" }),
				accessorKey: "expiration_date",
				id: "expiration_date",
				cell: ({ row }) => (
					<BatchExpiration
						expirationDate={row.original.expiration_date}
					/>
				),
			},
			{
				header: intl.formatMessage({ id: "stock" }),
				// id: "product",
				cell: ({ row }) => (
					<BatchStock
						current={row.original.current_quantity_units ?? 0}
						initial={row.original.initial_quantity_units ?? 0}
					/>
				),
			},
			{
				header: intl.formatMessage({ id: "actions" }),
				id: "actions",
				cell: ({ row }) => <BatchTableActions row={row} />,
			},
		],
		[intl],
	);
	return columns;
};

export const useSaleColumns = () => {
	const intl = useIntl();
	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "date" }),
				id: "saleDate",
				cell: ({ row }) => <TransactionDate row={row} />,
			},
			{
				header: intl.formatMessage({ id: "sales.assintant" }),
				id: "employee",
				cell: ({ row }) => <TransactionEmployee row={row} />,
			},
			{
				header: intl.formatMessage({ id: "sale.doctor" }),
				id: "doctorInfo",
				cell: ({ row }) => {
					const { doctorName, prescriptionNumber } = row.original;

					if (!doctorName && !prescriptionNumber) {
						return <span className="text-gray-400">-</span>;
					}

					return (
						<div className="flex flex-col gap-1.5 justify-center">
							{doctorName && (
								<div
									className="flex items-center gap-2"
									data-tooltip-id="global-tooltip"
									data-tooltip-content={intl.formatMessage({
										id: "sale.doctor",
									})}
								>
									{/* Contenedor para el icono: imita el estilo de la columna "Dependiente" */}
									<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 ">
										<FaUserDoctor className="size-3.5" />
									</div>
									<span className="text-sm font-semibold text-gray-900 capitalize dark:text-gray-100">
										{doctorName.toLowerCase()}
									</span>
								</div>
							)}

							{prescriptionNumber && (
								<div
									className="flex items-center gap-2"
									data-tooltip-id="global-tooltip"
									data-tooltip-content={intl.formatMessage({
										id: "sale.prescription_number",
									})}
								>
									{/* Icono y texto más tenues para indicar información secundaria */}
									<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400">
										<RiReceiptLine className="size-4" />
									</div>
									<span className="text-xs font-medium text-gray-500 dark:text-gray-100">
										{prescriptionNumber}
									</span>
								</div>
							)}
						</div>
					);
				},
			},
			{
				header: intl.formatMessage({ id: "products" }, { count: 2 }),
				id: "saleDetails",
				cell: ({ row }) => <TransactionMedicine row={row} />,
			},
			{
				header: intl.formatMessage({ id: "paymentMean" }),
				id: "payment",
				cell: ({ row }) => <TransactionPay row={row} />,
			},
		],
		[intl],
	);
	return columns;
};


export const useMechanicColumns = () => {
	const intl = useIntl();
	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "name" }),
				id: "firstName",
				cell: ({ row }) => (
					<div className="flex items-center gap-4">
						<span className="text-base font-semibold text-gray-800 dark:text-gray-100">
							{row.original.firstName} {row.original.lastName}
						</span>
					</div>
				),
			},
			{
				header: "Especialidad",
				id: "specialty",
				cell: ({ row }) => (
					<div className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
						{row.original.specialty && (
							<div className="flex items-center gap-2">
								<span
									className="truncate max-w-[180px]"
								>
									{row.original.specialty.name}
								</span>
							</div>
						)}
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "statuses" }),
				accessorKey: "isActive",
				cell: ({ getValue }) => (
					<Status status={getValue() ? true : false} />
				),
			},
			{
				id: "actions",
				cell: ({ row }) => <MechanicCellActions row={row} />,
			},
		],
		[intl],
	);

	return columns;
};

export const useCompanyColumns = () => {
	const intl = useIntl();
	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "company.info", defaultMessage: "Empresa" }),
				accessorKey: "company.name",
                id: "company.name",
				cell: ({ row }) => (
					<div className="flex items-center gap-4">
						{row.original.logoUrl ? (
							<div className="w-10 h-10 flex-shrink-0 bg-gray-50 dark:bg-dark-800 rounded-lg p-1 border border-gray-100 dark:border-dark-700">
								<img
									src={row.original.logoUrl}
									alt={row.original.name}
									className="w-full h-full object-contain"
								/>
							</div>
						) : (
							<div className="w-10 h-10 flex-shrink-0 bg-gray-100 dark:bg-dark-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-dark-600">
								<span className="text-sm font-bold text-gray-400">
									{row.original.name.charAt(0).toUpperCase()}
								</span>
							</div>
						)}
						<div className="flex flex-col">
							<span className="text-base font-semibold text-gray-800 dark:text-gray-100">
								{row.original.name}
							</span>
							{row.original.taxId && (
								<span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1 font-medium">
									<IdentificationIcon className="size-3.5" />
									{row.original.taxId}
								</span>
							)}
						</div>
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "contact", defaultMessage: "Contacto" }),
				id: "contact",
				cell: ({ row }) => (
					<div className="flex flex-col gap-1">
						{row.original.contactPhone && (
							<div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
								<PhoneIcon className="size-4 text-gray-400" />
								{row.original.contactPhone}
							</div>
						)}
						{row.original.contactEmail && (
							<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
								<EnvelopeIcon className="size-3.5 text-gray-400" />
								<span className="truncate max-w-[150px]" title={row.original.contactEmail}>
									{row.original.contactEmail}
								</span>
							</div>
						)}
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "details", defaultMessage: "Detalles" }),
				id: "details",
				cell: ({ row }) => (
					<div className="flex flex-col gap-1.5">
						{row.original.billingAddress && (
							<div className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
								<MapPinIcon className="size-4 shrink-0 mt-0.5 text-gray-400" />
								<span className="line-clamp-2 max-w-[200px]" title={row.original.billingAddress}>
									{row.original.billingAddress}
								</span>
							</div>
						)}
						{row.original.defaultCurrency && (
							<div className="flex items-center">
								<span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 ring-1 ring-inset ring-gray-500/10 uppercase">
									{row.original.defaultCurrency}
								</span>
							</div>
						)}
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "status", defaultMessage: "Estado" }),
				accessorKey: "isActive",
				cell: ({ getValue }) => (
					<Status status={getValue() ? true : false} />
				),
			},
			{
				id: "actions",
				cell: ({ row }) => <CompanyCellActions row={row} />,
			},
		],
		[intl],
	);

	return columns;
};

export const useInventoryColumns = () => {
	const intl = useIntl();

	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "product", defaultMessage: "Repuesto" }),
				id: "product_info",
				cell: ({ row }) => <InventoryPartProductInfo row={row} />,
			},
			{
				header: intl.formatMessage({ id: "stock", defaultMessage: "Inventario" }),
				id: "stock",
				cell: ({ row }) => {
					const { stockQuantity, minStockAlert } = row.original;
					const isLow = stockQuantity <= minStockAlert;
					return (
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-2">
								<div
									className={`size-2.5 rounded-full ${
										stockQuantity <= 0
											? "bg-gray-500"
											: isLow
												? "bg-red-500"
												: stockQuantity <= minStockAlert * 1.5
													? "bg-yellow-500"
													: "bg-green-500"
									}`}
									title={`M�nimo: ${minStockAlert}`}
								/>
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{stockQuantity} uds.
								</span>
							</div>
						</div>
					);
				},
			},
			{
				header: intl.formatMessage({ id: "pricing", defaultMessage: "Precios" }),
				id: "pricing",
				cell: ({ row }) => {
					const { totalUnitCost, basePrice, currency } = row.original;
					return (
						<div className="flex flex-col gap-1 text-sm font-medium">
							<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
								<span className="text-xs">Costo:</span>
								<span>{currency} {totalUnitCost?.toFixed(2)}</span>
							</div>
							<div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold">
								<span className="text-xs text-gray-500 dark:text-gray-400">Precio:</span>
								<span>{currency} {basePrice?.toFixed(2)}</span>
							</div>
						</div>
					);
				},
			},
			{
				header: intl.formatMessage({ id: "status", defaultMessage: "Estado" }),
				accessorKey: "isActive",
				cell: ({ getValue }) => (
					<Status status={getValue() ? true : false} />
				),
			},
			{
				id: "actions",
				cell: ({ row }) => <InventoryPartCellActions row={row} />,
			},
		],
		[intl],
	);

	return columns;
};




import { VehicleModelCellActions } from "./CustomCells/VehicleModelCellActions";

export const useVehicleModelColumns = () => {
	const intl = useIntl();
	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				header: intl.formatMessage({ id: "modelName", defaultMessage: "Modelo" }),
				id: "modelName",
				cell: ({ row }) => (
					<div className="flex items-center gap-4">
						<span className="text-base font-semibold text-gray-800 dark:text-gray-100">
							{row.original.modelName}
						</span>
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "brand", defaultMessage: "Marca" }),
				id: "brand",
				cell: ({ row }) => (
					<div className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
						{row.original.brand && (
							<span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full w-fit border border-gray-200 dark:border-gray-700">
								{row.original.brand.brandName}
							</span>
						)}
					</div>
				),
			},
			{
				header: intl.formatMessage({ id: "actions" }),
				id: "actions",
				cell: ({ row }) => <VehicleModelCellActions row={row} />,
			},
		],
		[intl]
	);
	return columns;
};

import { VehicleBrandModel } from "./CustomCells/VehicleBrandModel";
import { VehicleStatus } from "./CustomCells/VehicleStatus";
import { VehicleDates } from "./CustomCells/VehicleDates";

export const useVehicleColumns = () => {
    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                header: "Vehículo",
                accessorKey: "plate",
                cell: ({ row }) => (
                    <div className="flex flex-col gap-1">
                        <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
                            {row.original.plate}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            VIN: {row.original.vin || "N/A"}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            Año: {row.original.year || "N/A"} | Milaje: {row.original.currentMilage || 0}
                        </span>
                    </div>
                ),
            },
            {
                header: "Modelo",
                accessorKey: "model.modelName",
                id: "model.modelName",
                cell: ({ row }) => (
                    <VehicleBrandModel 
                        brandName={row.original.model?.brand?.brandName} 
                        modelName={row.original.model?.modelName} 
                    />
                ),
            },
            {
                header: "Empresa",
                // accessorKey: "plate",
                accessorKey: "company.name",
                id: "company.name",
                cell: ({ row }) => (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {row.original.company?.name || "Disponible"}
                    </span>
                ),
            },
            {
                header: "Estado",
                accessorKey: "status",
                cell: ({ row }) => (
                    <VehicleStatus status={row.original.status} />
                ),
            },
            {
                header: "Vencimientos",
                id: "dates",
                cell: ({ row }) => (
                    <VehicleDates 
                        insuranceDate={row.original.insuranceExpirationDate}
                        mechanicalDate={row.original.mechanicalInspectionExpiration}
                        emissionsDate={row.original.emissionsInspectionExpiration}
                        maintenanceDate={row.original.nextMaintenanceDate}
                    />
                ),
            },
            {
                id: "actions",
                cell: ({ row }) => <VehicleCellActions row={row} />,
            },
        ],
        []
    );
    return columns;
};








