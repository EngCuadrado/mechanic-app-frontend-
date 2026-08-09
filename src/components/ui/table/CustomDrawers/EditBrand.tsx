import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Checkbox from "../../../form/input/Checkbox";
import ComponentCard from "../../../common/ComponentCard";

import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const UPDATE_BRAND = gql`
	mutation UpdateBrand(
		$id_brand: Int!
		$name: String!
		$contact_phone: String!
		$contact_email: String!
		$logo_url: String!
		$is_active: Boolean!
	) {
		updateBrand(
			id_brand: $id_brand
			name: $name
			contact_phone: $contact_phone
			contact_email: $contact_email
			logo_url: $logo_url
			is_active: $is_active
		) {
			id_brand
			name
			contact_phone
			contact_email
			logo_url
			is_active
			created_at
			updated_at
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

interface EditBrandProps {
	row: {
		original: BrandData;
	};
	onClose: () => void;
}

export default function EditBrand({ row, onClose }: EditBrandProps) {
	const intl = useIntl();
	const brandData = row.original;

	const [name, setName] = useState(brandData.name || "");
	const [email, setEmail] = useState(brandData.contact_email || "");
	const [phone, setPhone] = useState(brandData.contact_phone || "");
	const [logoUrl, setLogoUrl] = useState(brandData.logo_url || "");
	const [isActive, setIsActive] = useState(brandData.is_active ?? true);
	const [emailError, setEmailError] = useState(false);

	const [updateBrandMutation, { loading }] = useMutation(UPDATE_BRAND, {
		refetchQueries: ["GetBrands"],
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
		validateEmail(value);
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
			await updateBrandMutation({
				variables: {
					id_brand: parseInt(brandData.id_brand, 10),
					name: name,
					contact_phone: phone,
					contact_email: email,
					logo_url: logoUrl,
					is_active: isActive,
				},
			});

			toast.success(intl.formatMessage({ id: "brand.update.success" }));
			onClose();
		} catch (err) {
			console.error("Error al guardar:", err);
			toast.error(intl.formatMessage({ id: "brand.update.error" }));
		}
	};

	return (
		<ComponentCard title="">
			<div className="space-y-6">
				{/* Name */}
				<div>
					<Label htmlFor="name_input">
						<FormattedMessage id="names" values={{ count: 1 }} />
					</Label>
					<Input
						type="text"
						id="name_input"
						value={name}
						onChange={(e) => setName(e.target.value)}
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

				{/* Logo URL */}
				<div>
					<Label htmlFor="logo_input">
						<FormattedMessage id="brand_logo" />
					</Label>
					<Input
						id="logo_input"
						type="text"
						value={logoUrl}
						placeholder="https://..."
						onChange={(e) => setLogoUrl(e.target.value)}
					/>
				</div>

				{/* Active Status */}
				<div>
					<Checkbox
						id="status_checkbox"
						label={intl.formatMessage(
							{ id: "status" },
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
