import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import TextArea from "../../../form/input/TextArea";
import Checkbox from "../../../form/input/Checkbox";
import ComponentCard from "../../../common/ComponentCard";

import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const UPDATE_ADMINISTRATION_ROUTE = gql`
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

interface EditAdministrationRouteProps {
	row: {
		original: AdministrationRouteData;
	};
	onClose: () => void;
}

export default function EditAdministrationRoute({
	row,
	onClose,
}: EditAdministrationRouteProps) {
	const intl = useIntl();
	const routeData = row.original;

	const [name, setName] = useState(routeData.name || "");
	const [description, setDescription] = useState(routeData.description || "");
	const [isActive, setIsActive] = useState(routeData.is_active ?? true);

	const [updateRouteMutation, { loading }] = useMutation(
		UPDATE_ADMINISTRATION_ROUTE,
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
			await updateRouteMutation({
				variables: {
					id: parseInt(String(routeData.administration_route_id), 10),
					name: name.trim(),
					description: description.trim(),
					is_active: isActive,
				},
			});

			toast.success(
				intl.formatMessage({ id: "administration_route.update.success" })
			);
			onClose();
		} catch (err) {
			console.error("Error al actualizar vía de administración:", err);
			toast.error(
				intl.formatMessage({ id: "administration_route.update.error" })
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
