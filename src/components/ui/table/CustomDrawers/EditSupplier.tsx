import { useState, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Select from "../../../form/Select";
import Checkbox from "../../../form/input/Checkbox";
import ComponentCard from "../../../common/ComponentCard";

import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { GET_SUPPLIER_TYPES_QUERY } from "../QuerysDefinitions";

const UPDATE_SUPPLIER = gql`
	mutation EditarProveedor(
		$id: Int!
		$supplierTypeId: Int
		$companyName: String
		$taxId: String
		$contactName: String
		$phone: String
		$address: String
		$email: String
		$website: String
		$isActive: Boolean
	) {
		updateSupplier(
			id: $id
			supplierTypeId: $supplierTypeId
			companyName: $companyName
			taxId: $taxId
			contactName: $contactName
			phone: $phone
			address: $address
			email: $email
			website: $website
			isActive: $isActive
		) {
			supplier_id
			supplier_type_id
			company_name
			tax_id
			contact_name
			phone
			address
			email
			website
			is_active
		}
	}
`;

interface SupplierData {
	supplier_id: string | number;
	company_name?: string;
	tax_id?: string;
	contact_name?: string;
	phone?: string;
	address?: string;
	email?: string;
	website?: string;
	is_active?: boolean;
	type?: {
		supplier_type_id: string | number;
		type_name: string;
	};
}

interface EditSupplierProps {
	row: {
		original: SupplierData;
	};
	onClose: () => void;
}

export default function EditSupplier({ row, onClose }: EditSupplierProps) {
	const intl = useIntl();
	const supplierData = row.original;

	const [companyName, setCompanyName] = useState(
		supplierData.company_name || ""
	);
	const [taxId, setTaxId] = useState(supplierData.tax_id || "");
	const [contactName, setContactName] = useState(
		supplierData.contact_name || ""
	);
	const [phone, setPhone] = useState(supplierData.phone || "");
	const [address, setAddress] = useState(supplierData.address || "");
	const [email, setEmail] = useState(supplierData.email || "");
	const [website, setWebsite] = useState(supplierData.website || "");
	const [isActive, setIsActive] = useState(supplierData.is_active ?? true);
	const [supplierTypeId, setSupplierTypeId] = useState<string>(
		supplierData.type?.supplier_type_id
			? String(supplierData.type.supplier_type_id)
			: ""
	);
	const [emailError, setEmailError] = useState(false);

	const { data: supplierTypesData } = useQuery(GET_SUPPLIER_TYPES_QUERY());

	const supplierTypeOptions = useMemo(() => {
		if (!supplierTypesData?.supplierTypes?.nodes) return [];
		return supplierTypesData.supplierTypes.nodes.map(
			(type: { supplier_type_id: string | number; type_name: string }) => ({
				value: String(type.supplier_type_id),
				label: type.type_name,
			})
		);
	}, [supplierTypesData]);

	const [updateSupplierMutation, { loading }] = useMutation(UPDATE_SUPPLIER, {
		refetchQueries: ["GetSuppliers"],
	});

	const validateEmail = (value: string) => {
		const isValidEmail =
			/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
		setEmailError(!isValidEmail);
		return isValidEmail;
	};

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEmail(value);
		if (value) {
			validateEmail(value);
		} else {
			setEmailError(false);
		}
	};

	const handleSubmit = async () => {
		if (email && !validateEmail(email)) {
			toast.error(
				intl.formatMessage(
					{ id: "brand.invalid_email" },
					{ defaultMessage: "Correo electrónico no válido" }
				)
			);
			return;
		}

		try {
			await updateSupplierMutation({
				variables: {
					id: parseInt(String(supplierData.supplier_id), 10),
					supplierTypeId: supplierTypeId
						? parseInt(supplierTypeId, 10)
						: null,
					companyName: companyName.trim(),
					taxId: taxId.trim(),
					contactName: contactName.trim(),
					phone: phone.trim(),
					address: address.trim(),
					email: email.trim(),
					website: website.trim(),
					isActive: isActive,
				},
			});

			toast.success(intl.formatMessage({ id: "supplier.update.success" }));
			onClose();
		} catch (err) {
			console.error("Error al actualizar proveedor:", err);
			toast.error(intl.formatMessage({ id: "supplier.update.error" }));
		}
	};

	return (
		<ComponentCard title="">
			<div className="space-y-6">
				{/* Company Name */}
				<div>
					<Label htmlFor="company_name_input">
						<FormattedMessage id="supplier.company_name" />
					</Label>
					<Input
						type="text"
						id="company_name_input"
						value={companyName}
						onChange={(e) => setCompanyName(e.target.value)}
					/>
				</div>

				{/* Tax ID */}
				<div>
					<Label htmlFor="tax_id_input">
						<FormattedMessage id="supplier.tax_id" />
					</Label>
					<Input
						type="text"
						id="tax_id_input"
						value={taxId}
						onChange={(e) => setTaxId(e.target.value)}
					/>
				</div>

				{/* Supplier Type */}
				<div>
					<Label htmlFor="supplier_type_select">
						<FormattedMessage id="supplier_types" />
					</Label>
					<Select
						options={supplierTypeOptions}
						placeholder={intl.formatMessage({
							id: "option.select",
							defaultMessage: "Seleccione una opción",
						})}
						value={supplierTypeId}
						onChange={(val) => setSupplierTypeId(val)}
					/>
				</div>

				{/* Contact Name */}
				<div>
					<Label htmlFor="contact_name_input">
						<FormattedMessage id="supplier.contact_name" />
					</Label>
					<Input
						type="text"
						id="contact_name_input"
						value={contactName}
						onChange={(e) => setContactName(e.target.value)}
					/>
				</div>

				{/* Phone */}
				<div>
					<Label htmlFor="phone_input">
						<FormattedMessage id="phone" />
					</Label>
					<div className="relative">
						<Input
							id="phone_input"
							type="text"
							value={phone}
							placeholder={intl.formatMessage({
								id: "contact_phone",
							})}
							className="pl-[62px]"
							onChange={(e) => setPhone(e.target.value)}
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
							<PhoneIcon className="size-6" />
						</span>
					</div>
				</div>

				{/* Email */}
				<div>
					<Label htmlFor="email_input">
						<FormattedMessage id="email" />
					</Label>
					<div className="relative">
						<Input
							id="email_input"
							type="email"
							value={email}
							error={emailError}
							onChange={handleEmailChange}
							placeholder={intl.formatMessage({
								id: "contact_email",
							})}
							className="pl-[62px]"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
							<EnvelopeIcon className="size-6" />
						</span>
					</div>
				</div>

				{/* Address */}
				<div>
					<Label htmlFor="address_input">
						<FormattedMessage id="address" />
					</Label>
					<Input
						type="text"
						id="address_input"
						value={address}
						onChange={(e) => setAddress(e.target.value)}
					/>
				</div>

				{/* Website */}
				<div>
					<Label htmlFor="website_input">
						<FormattedMessage id="supplier.website" />
					</Label>
					<Input
						type="text"
						id="website_input"
						value={website}
						placeholder="www.example.com"
						onChange={(e) => setWebsite(e.target.value)}
					/>
				</div>

				{/* Active Status Checkbox */}
				<div>
					<Checkbox
						id="status_checkbox"
						label={intl.formatMessage(
							{ id: "statuses" },
							{ defaultMessage: "Activo" }
						)}
						checked={isActive}
						onChange={(checked) => setIsActive(checked)}
					/>
				</div>

				<div className="flex flex-row justify-end gap-3">
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center justify-center gap-2"
					>
						<FormattedMessage id="cancel" />
					</button>
					<button
						onClick={handleSubmit}
						disabled={loading}
						className="px-4 py-2 text-white rounded-xl transition-colors flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
					>
						<FormattedMessage id="save" />
					</button>
				</div>
			</div>
		</ComponentCard>
	);
}
