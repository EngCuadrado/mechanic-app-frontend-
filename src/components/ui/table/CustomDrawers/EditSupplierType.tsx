import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";

import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import TextArea from "../../../form/input/TextArea";
import ComponentCard from "../../../common/ComponentCard";

import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const UPDATE_SUPPLIER_TYPE = gql`
	mutation UpdateSupplierType(
		$id: Int!
		$typeName: String!
		$description: String!
	) {
		updateSupplierType(
			id: $id
			typeName: $typeName
			description: $description
		) {
			supplier_type_id
			type_name
			description
		}
	}
`;

interface SupplierTypeData {
	supplier_type_id: string | number;
	type_name: string;
	description?: string;
}

interface EditSupplierTypeProps {
	row: {
		original: SupplierTypeData;
	};
	onClose: () => void;
}

export default function EditSupplierType({
	row,
	onClose,
}: EditSupplierTypeProps) {
	const intl = useIntl();
	const typeData = row.original;

	const [typeName, setTypeName] = useState(typeData.type_name || "");
	const [description, setDescription] = useState(typeData.description || "");

	const [updateSupplierTypeMutation, { loading }] = useMutation(
		UPDATE_SUPPLIER_TYPE,
		{
			refetchQueries: ["GetSupplierTypes"],
		}
	);

	const handleSubmit = async () => {
		if (!typeName.trim()) {
			toast.error(
				intl.formatMessage(
					{ id: "name_required" },
					{ defaultMessage: "El nombre es requerido" }
				)
			);
			return;
		}

		try {
			await updateSupplierTypeMutation({
				variables: {
					id: parseInt(String(typeData.supplier_type_id), 10),
					typeName: typeName.trim(),
					description: description.trim(),
				},
			});

			toast.success(
				intl.formatMessage({ id: "supplier_type.update.success" })
			);
			onClose();
		} catch (err) {
			console.error("Error al actualizar tipo de proveedor:", err);
			toast.error(
				intl.formatMessage({ id: "supplier_type.update.error" })
			);
		}
	};

	return (
		<ComponentCard title="">
			<div className="space-y-6">
				{/* Type Name */}
				<div>
					<Label htmlFor="type_name_input">
						<FormattedMessage id="supplier_type.type_name" />
					</Label>
					<Input
						type="text"
						id="type_name_input"
						value={typeName}
						onChange={(e) => setTypeName(e.target.value)}
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
