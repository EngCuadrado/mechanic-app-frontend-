import { toast } from "sonner";
import { useState, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useQuery, useApolloClient } from "@apollo/client/react";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Select from "../../../form/Select";
import ComponentCard from "../../../common/ComponentCard";
import { GET_EMPLOYEE_ROLE } from "../QuerysDefinitions";

const baseUrl = import.meta.env.VITE_BASE_API_URL;

// --- Definición de Tipos ---

interface AddEmployeeFormProps {
	onClose: () => void;
	onSaveSuccess: () => void;
}

interface CreateEmployeePayload {
	names: string;
	lastnames: string;
	phone: string;
	user: string;
	password: string;
	email: string;
	url_photo: string;
	employee_role_id: string;
}

const initialState: CreateEmployeePayload = {
	names: "",
	lastnames: "",
	phone: "",
	user: "",
	password: "",
	email: "",
	url_photo: "",
	employee_role_id: "",
};

export default function AddEmployeeForm({
	onClose,
	onSaveSuccess,
}: AddEmployeeFormProps) {
	const intl = useIntl();
	const client = useApolloClient();

	const [formData, setFormData] =
		useState<CreateEmployeePayload>(initialState);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// --- Fetch Roles ---
	const { data: rolesData } = useQuery(GET_EMPLOYEE_ROLE());

	const roleOptions = useMemo(() => {
		if (!rolesData?.employeeRoles) return [];
		return rolesData.employeeRoles.map((role: any) => ({
			value: String(role.employeeRoleId),
			label: role.name,
		}));
	}, [rolesData]);

	// --- Handlers ---

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSelectChange = (value: string) => {
		setFormData((prev) => ({
			...prev,
			employee_role_id: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsSubmitting(true);
		setError(null);

		try {
			// Convertir employee_role_id a número para la API si es necesario
			const payload = {
				...formData,
				employee_role_id: parseInt(formData.employee_role_id, 10) || 0,
			};

			const response = await fetch(
				baseUrl + "api/Employee/createEmployee",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						accept: "text/plain",
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					errorText || `Error del servidor: ${response.status}`,
				);
			}

			toast.success(
				intl.formatMessage({ id: "employee.create.success" }),
			);

			// Forzamos el refetch de la tabla de empleados antes de llamar a onSaveSuccess
			await client.refetchQueries({
				include: ["GetEmployees"],
			});

			onSaveSuccess();
		} catch (err: any) {
			setError(err.message);
			console.error("Error al crear empleado:", err);
			toast.error(intl.formatMessage({ id: "employee.create.error" }));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<ComponentCard title="">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label htmlFor="names">
							<FormattedMessage
								id="names"
								values={{ count: 2 }}
							/>
						</Label>
						<Input
							type="text"
							id="names"
							name="names"
							value={formData.names}
							onChange={handleChange}
							autoComplete="off"
							required
						/>
					</div>

					<div>
						<Label htmlFor="lastnames">
							<FormattedMessage id="lastnames" />
						</Label>
						<Input
							type="text"
							id="lastnames"
							name="lastnames"
							value={formData.lastnames}
							onChange={handleChange}
							autoComplete="off"
							required
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label htmlFor="email">
							<FormattedMessage id="email" />
						</Label>
						<Input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							autoComplete="new-email"
							required
						/>
					</div>

					<div>
						<Label htmlFor="phone">
							<FormattedMessage id="phone" />
						</Label>
						<Input
							type="tel"
							id="phone"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							autoComplete="off"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label htmlFor="user">
							<FormattedMessage id="user" />
						</Label>
						<Input
							type="text"
							id="user"
							name="user"
							value={formData.user}
							onChange={handleChange}
							autoComplete="off"
							required
						/>
					</div>

					<div>
						<Label htmlFor="password">
							<FormattedMessage id="password" />
						</Label>
						<Input
							type="password"
							id="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							autoComplete="new-password"
							required
						/>
					</div>
				</div>

				<div>
					<Label htmlFor="role">
						<FormattedMessage id="role" />
					</Label>
					<Select
						options={roleOptions}
						placeholder={intl.formatMessage({
							id: "option.select",
						})}
						value={formData.employee_role_id}
						onChange={handleSelectChange}
					/>
				</div>

				{error && (
					<div className="text-red-600 text-sm">
						<strong>Error:</strong> {error}
					</div>
				)}

				<div className="flex justify-end gap-3 pt-2">
					<button
						type="submit"
						disabled={isSubmitting}
						className="px-4 py-2 text-white rounded-xl transition-colors flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300"
				>
						{isSubmitting
							? intl.formatMessage({ id: "saving" })
							: intl.formatMessage({ id: "save" })}
					</button>
				</div>
			</form>
		</ComponentCard>
	);
}
