import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import FileInput from "../../../form/input/FileInput";
import ComponentCard from "../../../common/ComponentCard";

import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const ADD_BRAND = gql`
	mutation AddBrand($name: String!, $phone: String!, $email: String!) {
		addBrand(name: $name, phone: $phone, email: $email) {
			id_brand
			name
		}
	}
`;

export default function AddNewBrand() {
	const intl = useIntl();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [error, setError] = useState(false);

	// Preparamos la mutación. 'mutateFunction' es el nombre que usaremos para dispararla.
	const [mutateFunction, { loading }] = useMutation(ADD_BRAND);

	const handleSubmit = async () => {
		try {
			await mutateFunction({
				variables: {
					name: name, // Mapea con $name
					phone: phone, // Mapea con $phone
					email: email, // Mapea con $email
				},
			});

			toast.success(intl.formatMessage({ id: "brand.create.success" }));
			setName("");
			setEmail("");
			setPhone("");
		} catch (err) {
			console.error("Error al guardar:", err);
			toast.error(intl.formatMessage({ id: "brand.create.error" }));
		}
	};

	const validateEmail = (value: string) => {
		const isValidEmail =
			/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
		setError(!isValidEmail);
		return isValidEmail;
	};

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEmail(value);
		validateEmail(value);
	};

	return (
		<ComponentCard title="">
			<div className="space-y-6">
				{/* Name */}
				<div>
					<Label htmlFor="input">
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
					<Label>
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
					<Label>
						<FormattedMessage id="email" />
					</Label>
					<div className="relative">
						<Input
							id="email_input"
							type="email"
							value={email}
							error={error}
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

				{/* Logo URL TODO */}
				<div>
					<Label>
						<FormattedMessage id="brand_logo" />{" "}
					</Label>
					<FileInput
						onChange={(e) => console.log(e.target.files)}
						className="custom-class"
					/>
				</div>

				<div className="flex flex-row justify-end">
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
