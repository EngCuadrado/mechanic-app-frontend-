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

interface EditEmployeeFormProps {
	row: any;
	onClose: () => void;
	onSaveSuccess: () => void;
}

interface UpdateEmployeePayload {
	names: string;
	lastnames: string;
	phone: string;
	user: string;
	password: string;
	email: string;
	url_photo: string;
	hiring_date: string;
	employeeRoleId: number;
	employeeStatusId: number;
}

export default function EditEmployeeForm({
	row,
	onClose,
	onSaveSuccess,
}: EditEmployeeFormProps) {
	const intl = useIntl();
	const client = useApolloClient();
	const employeeData = row.original;

	const [formData, setFormData] = useState<UpdateEmployeePayload>({
		names: employeeData.names || "",
		lastnames: employeeData.lastnames || "",
		phone: employeeData.phone || "",
		user: employeeData.user || "",
		password: "",
		email: employeeData.email || "",
		url_photo: employeeData.url_photo || "",
		hiring_date: employeeData.hiring_date || new Date().toISOString(),
		employeeRoleId: parseInt(employeeData.employeeRoleId) || 0,
		employeeStatusId: parseInt(employeeData.employeeStatusId) || 0,
	});

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

	const handleSelectChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: parseInt(value, 10) || 0,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsSubmitting(true);
		setError(null);

		try {
			const response = await fetch(
				`${baseUrl}api/Employee/updateEmployee/${employeeData.employeeId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						accept: "text/plain",
					},
					body: JSON.stringify(formData),
				},
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					errorText || `Error del servidor: ${response.status}`,
				);
			}

			toast.success(
				intl.formatMessage({ id: "employee.update.success" }),
			);

			// Forzamos el refetch de la tabla de empleados
			await client.refetchQueries({
				include: ["GetEmployees"],
			});

			onSaveSuccess();
		} catch (err: any) {
			setError(err.message);
			console.error("Error al actualizar empleado:", err);
			toast.error(intl.formatMessage({ id: "employee.update.error" }));
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
								values={{ count: 1 }}
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
							autoComplete="off"
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
							autoComplete="off"
							placeholder="••••••••"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label htmlFor="employeeRoleId">
							<FormattedMessage id="role" />
						</Label>
						<Select
							options={roleOptions}
							placeholder={intl.formatMessage({
								id: "option.select",
							})}
							value={String(formData.employeeRoleId)}
							onChange={(val) =>
								handleSelectChange("employeeRoleId", val)
							}
						/>
					</div>

					<div>
						<Label htmlFor="hiring_date">
							<FormattedMessage id="hiring_date" />
						</Label>
						<Input
							type="date"
							id="hiring_date"
							name="hiring_date"
							value={formData.hiring_date.split("T")[0]}
							onChange={handleChange}
							autoComplete="off"
							required
						/>
					</div>
				</div>

				{error && (
					<div className="text-red-600 text-sm">
						<strong>Error:</strong> {error}
					</div>
				)}

				<div className="flex justify-end gap-3 pt-2">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{intl.formatMessage({ id: "cancel" })}
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						className="px-4 py-2 text-white rounded-xl transition-colors flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
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
