import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";
import { EnvelopeIcon, PhoneIcon, MapPinIcon, IdentificationIcon, CurrencyDollarIcon, PhotoIcon } from "@heroicons/react/24/outline";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Select from "../../../form/Select";

import { useMutation } from "@apollo/client/react";
import { ADD_COMPANY_MUTATION, GET_COMPANIES_QUERY } from "../QuerysDefinitions";

export default function AddNewCompany({ onClose }: { onClose?: () => void }) {
	const intl = useIntl();

	const [name, setName] = useState("");
	const [taxId, setTaxId] = useState("");
	const [billingAddress, setBillingAddress] = useState("");
	const [contactEmail, setContactEmail] = useState("");
	const [contactPhone, setContactPhone] = useState("");
	const [defaultCurrency, setDefaultCurrency] = useState("USD");
	const [logoUrl, setLogoUrl] = useState("");

	const [mutateFunction, { loading }] = useMutation(ADD_COMPANY_MUTATION, {
		refetchQueries: [{ query: GET_COMPANIES_QUERY() }],
	});

	const handleSubmit = async () => {
		if (!name || !taxId) {
			toast.error(intl.formatMessage({ id: "company.error.requiredFields", defaultMessage: "El nombre y RUC son requeridos" }));
			return;
		}

		try {
			await mutateFunction({
				variables: {
					name,
					taxId,
					billingAddress,
					contactEmail,
					contactPhone,
					defaultCurrency,
					logoUrl: "", // forced to empty string per user request to send null
				},
			});

			toast.success(intl.formatMessage({ id: "company.create.success", defaultMessage: "Empresa creada correctamente" }));
			setName("");
			setTaxId("");
			setBillingAddress("");
			setContactEmail("");
			setContactPhone("");
			setDefaultCurrency("USD");
			setLogoUrl("");
			
			if (onClose) onClose();
		} catch (err) {
			console.error("Error al guardar:", err);
			toast.error(intl.formatMessage({ id: "company.create.error", defaultMessage: "Error al crear empresa" }));
		}
	};

	return (
		<div title="">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Name */}
				<div className="col-span-1 md:col-span-2">
					<Label htmlFor="name_input">
						<FormattedMessage id="name" defaultMessage="Nombre de la empresa" /> *
					</Label>
					<Input
						type="text"
						id="name_input"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Ej. Tech Corp Latam"
					/>
				</div>

				{/* Tax ID */}
				<div className="col-span-1">
					<Label htmlFor="taxId_input">
						<FormattedMessage id="taxId" defaultMessage="RUC / NIT" /> *
					</Label>
					<div className="relative">
						<Input
							type="text"
							id="taxId_input"
							value={taxId}
							onChange={(e) => setTaxId(e.target.value)}
							className="pl-[42px]"
							placeholder="Ej. 123456789-0"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<IdentificationIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Default Currency */}
				<div className="col-span-1">
					<Label htmlFor="currency_input">
						<FormattedMessage id="currency" defaultMessage="Moneda por Defecto" />
					</Label>
					<div className="relative">
						<Select
							options={[
								{ value: "USD", label: "USD - Dólares" },
								{ value: "NIO", label: "NIO - Córdobas" }
							]}
							value={defaultCurrency}
							onChange={(val) => setDefaultCurrency(val)}
							className="pl-[42px]"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500 pointer-events-none">
							<CurrencyDollarIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Phone */}
				<div className="col-span-1">
					<Label htmlFor="phone_input">
						<FormattedMessage id="phone" defaultMessage="Teléfono de Contacto" />
					</Label>
					<div className="relative">
						<Input
							type="text"
							id="phone_input"
							value={contactPhone}
							onChange={(e) => setContactPhone(e.target.value)}
							className="pl-[42px]"
							placeholder="Ej. +123456789"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<PhoneIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Email */}
				<div className="col-span-1">
					<Label htmlFor="email_input">
						<FormattedMessage id="email" defaultMessage="Correo Electrónico" />
					</Label>
					<div className="relative">
						<Input
							type="email"
							id="email_input"
							value={contactEmail}
							onChange={(e) => setContactEmail(e.target.value)}
							className="pl-[42px]"
							placeholder="admin@techcorp.com"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<EnvelopeIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Billing Address */}
				<div className="col-span-1 md:col-span-2">
					<Label htmlFor="address_input">
						<FormattedMessage id="billingAddress" defaultMessage="Dirección de Facturación" />
					</Label>
					<div className="relative">
						<Input
							type="text"
							id="address_input"
							value={billingAddress}
							onChange={(e) => setBillingAddress(e.target.value)}
							className="pl-[42px]"
							placeholder="Oficinas Centrales, Ciudad"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<MapPinIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Logo URL */}
				<div className="col-span-1 md:col-span-2">
					<Label htmlFor="logo_input">
						<FormattedMessage id="logo" defaultMessage="Logo de la empresa" />
					</Label>
					<div className="relative">
						<Input
							type="file"
							id="logo_input"
							accept="image/*"
							onChange={(e) => {
								// Por ahora no hacemos nada con el archivo, mandaremos "" al backend
								console.log("Archivo seleccionado:", e.target.files?.[0]);
							}}
							className="pl-[42px] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/30 dark:file:text-brand-400"
						/>
						<span className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-gray-500">
							<PhotoIcon className="size-5" />
						</span>
					</div>
				</div>

				{/* Actions */}
				<div className="col-span-1 md:col-span-2 flex justify-end mt-4">
					<button
						onClick={handleSubmit}
						disabled={loading}
						className="px-6 py-2.5 text-white rounded-xl transition-colors flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed shadow-sm shadow-brand-500/20"
					>
						<FormattedMessage id="save" defaultMessage="Guardar" />
					</button>
				</div>
			</div>
		</div>
	);
}
