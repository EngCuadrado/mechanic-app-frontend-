import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Checkbox from "../../../form/input/Checkbox";
import ComponentCard from "../../../common/ComponentCard";

import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const UPDATE_ACTIVE_INGREDIENT = gql`
	mutation UpdateActiveIngredient(
		$id: Int!
		$name: String!
		$is_controlled: Boolean!
		$is_active: Boolean!
	) {
		updateActiveIngredient(
			id: $id
			name: $name
			is_controlled: $is_controlled
			is_active: $is_active
		) {
			active_ingredient_id
			name
			description
			is_controlled
			is_active
		}
	}
`;

interface ActiveIngredientData {
	active_ingredient_id: string | number;
	name: string;
	description?: string;
	is_controlled?: boolean;
	is_active?: boolean;
}

interface EditActiveIngredientProps {
	row: {
		original: ActiveIngredientData;
	};
	onClose: () => void;
}

export default function EditActiveIngredient({
	row,
	onClose,
}: EditActiveIngredientProps) {
	const intl = useIntl();
	const ingredientData = row.original;

	const [name, setName] = useState(ingredientData.name || "");
	const [isControlled, setIsControlled] = useState(
		ingredientData.is_controlled ?? false
	);
	const [isActive, setIsActive] = useState(ingredientData.is_active ?? true);

	const [updateActiveIngredientMutation, { loading }] = useMutation(
		UPDATE_ACTIVE_INGREDIENT,
		{
			refetchQueries: ["GetActiveIngredients"],
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
			await updateActiveIngredientMutation({
				variables: {
					id: parseInt(String(ingredientData.active_ingredient_id), 10),
					name: name.trim(),
					is_controlled: isControlled,
					is_active: isActive,
				},
			});

			toast.success(
				intl.formatMessage({ id: "active_ingredient.update.success" })
			);
			onClose();
		} catch (err) {
			console.error("Error al actualizar principio activo:", err);
			toast.error(
				intl.formatMessage({ id: "active_ingredient.update.error" })
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

				{/* Controlled Status Checkbox */}
				<div>
					<Checkbox
						id="controlled_checkbox"
						label={intl.formatMessage({
							id: "active_ingredient.is_controlled",
						})}
						checked={isControlled}
						onChange={(checked) => setIsControlled(checked)}
					/>
				</div>

				{/* Active Status Checkbox */}
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
