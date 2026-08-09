import { useState, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Select from "../../../form/Select";
import ComponentCard from "../../../common/ComponentCard";

import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { GET_SUPPLIER_TYPES_QUERY } from "../QuerysDefinitions";

const CREATE_SUPPLIER = gql`
	mutation CreateSupplier(
		$supplierTypeId: Int!
		$companyName: String!
		$taxId: String!
		$contactName: String!
		$phone: String!
		$address: String!
		$email: String!
		$website: String!
	) {
		createSupplier(
			supplierTypeId: $supplierTypeId
			companyName: $companyName
			taxId: $taxId
			contactName: $contactName
			phone: $phone
			address: $address
			email: $email
			website: $website
		) {
			supplierId: supplier_id
			supplierTypeId: supplier_type_id
			companyName: company_name
			taxId: tax_id
			contactName: contact_name
			phone
			address
			email
			website
			isActive: is_active
		}
	}
`;

interface AddNewSupplierProps {
	onClose: () => void;
}

export default function AddNewSupplier({ onClose }: AddNewSupplierProps) {
	const intl = useIntl();

	const [companyName, setCompanyName] = useState("");
	const [taxId, setTaxId] = useState("");
	const [contactName, setContactName] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");
	const [email, setEmail] = useState("");
	const [website, setWebsite] = useState("");
	const [supplierTypeId, setSupplierTypeId] = useState<string>("");
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

	const [createSupplierMutation, { loading }] = useMutation(CREATE_SUPPLIER, {
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
		if (!companyName.trim()) {
			toast.error(
				intl.formatMessage(
					{ id: "name_required" },
					{ defaultMessage: "El nombre de la empresa es requerido" }
				)
			);
			return;
		}

		if (!supplierTypeId) {
			toast.error(
				intl.formatMessage(
					{ id: "supplier_type_required" },
					{ defaultMessage: "El tipo de proveedor es requerido" }
				)
			);
			return;
		}

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
			await createSupplierMutation({
				variables: {
					supplierTypeId: parseInt(supplierTypeId, 10),
					companyName: companyName.trim(),
					taxId: taxId.trim(),
					contactName: contactName.trim(),
					phone: phone.trim(),
					address: address.trim(),
					email: email.trim(),
					website: website.trim(),
				},
			});

			toast.success(intl.formatMessage({ id: "supplier.create.success" }));
			onClose();
		} catch (err) {
			console.error("Error al crear proveedor:", err);
			toast.error(intl.formatMessage({ id: "supplier.create.error" }));
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
						required
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
						required
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
