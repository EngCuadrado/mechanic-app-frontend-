import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import TextArea from "../../../form/input/TextArea";
import ComponentCard from "../../../common/ComponentCard";

import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const CREATE_ADMINISTRATION_ROUTE = gql`
	mutation CreateAdministrationRoute($name: String!, $description: String!) {
		createAdministrationRoute(name: $name, description: $description) {
			administrationRouteId: administration_route_id
			name
			description
			isActive: is_active
		}
	}
`;

interface AddNewAdministrationRouteProps {
	onClose?: () => void;
}

export default function AddNewAdministrationRoute({
	onClose,
}: AddNewAdministrationRouteProps) {
	const intl = useIntl();

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const [createRouteMutation, { loading }] = useMutation(
		CREATE_ADMINISTRATION_ROUTE,
		{
			refetchQueries: ["GetAdministrationRoutes"],
		}
	);

	const handleSubmit = async () => {
		if (!name.trim()) {
			toast.error(
				intl.formatMessage(
					{ id: "name_required" },
					{ defaultMessage: "El nombre es requerido" }
				)
			);
			return;
		}

		try {
			await createRouteMutation({
				variables: {
					name: name.trim(),
					description: description.trim(),
				},
			});

			toast.success(
				intl.formatMessage({ id: "administration_route.create.success" })
			);
			setName("");
			setDescription("");
			if (onClose) {
				onClose();
			}
		} catch (err) {
			console.error("Error al guardar vía de administración:", err);
			toast.error(
				intl.formatMessage({ id: "administration_route.create.error" })
			);
		}
	};

	return (
		<ComponentCard title="">
			<div className="space-y-6">
				{/* Name */}
				<div>
					<Label htmlFor="name_input">
						<FormattedMessage id="name" />
					</Label>
					<Input
						type="text"
						id="name_input"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</div>

				{/* Description */}
				<div>
					<Label htmlFor="description_input">
						<FormattedMessage id="description" />
					</Label>
					<TextArea
						id="description_input"
						value={description}
						onChange={(val) => setDescription(val)}
						placeholder={intl.formatMessage(
							{ id: "description_placeholder" },
							{ defaultMessage: "Escribe una descripción..." }
						)}
						rows={4}
					/>
				</div>

				<div className="flex flex-row justify-end gap-3">
					{onClose && (
						<button
							onClick={onClose}
							className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center justify-center gap-2"
						>
							<FormattedMessage id="cancel" />
						</button>
					)}
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
