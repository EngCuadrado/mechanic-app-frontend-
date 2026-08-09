import * as React from "react";
import { Fragment, useState } from "react";
import { Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import DatePicker from "../../../form/date-picker";
import Checkbox from "../../../form/input/Checkbox";
import { useMutation } from "@apollo/client/react";
import { UPDATE_BATCH_MUTATION } from "../QuerysDefinitions";
import { toast } from "sonner";
import { nicaDate } from "../../../../utils/dateUtils";

export default function EditBatch({
	batch,
	onClose,
}: {
	batch: any;
	onClose?: () => void;
}) {
	const intl = useIntl();

	const formatToISO = (date: any) => {
		return nicaDate(date).startOf("day").toISOString();
	};

	const [formData, setFormData] = useState({
		batchCode: batch.batch_code || "",
		expirationDate: batch.expiration_date || "",
		currentQuantityUnits: batch.current_quantity_units || 0,
		isActive: batch.is_active ?? true,
	});

	const [updateBatch, { loading }] = useMutation(UPDATE_BATCH_MUTATION, {
		refetchQueries: ["GetBatches", "GetMedicineTherapeuticDetails"],
		awaitRefetchQueries: true,
		onCompleted: (data) => {
			if (data.updateBatch.result) {
				toast.success(
					data.updateBatch.message ||
						intl.formatMessage({ id: "batch.update.success" }),
				);
				onClose?.();
			} else {
				toast.error(
					data.updateBatch.message ||
						intl.formatMessage({ id: "batch.update.error" }),
				);
			}
		},
		onError: (error) => {
			toast.error(error.message || intl.formatMessage({ id: "error" }));
		},
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "currentQuantityUnits" ? parseInt(value) || 0 : value,
		}));
	};

	const handleDateChange = (selectedDates: Date[]) => {
		if (selectedDates.length > 0) {
			setFormData((prev) => ({
				...prev,
				expirationDate: formatToISO(selectedDates[0]),
			}));
		}
	};

	const handleCheckboxChange = (val: boolean) => {
		setFormData((prev) => ({ ...prev, isActive: val }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		updateBatch({
			variables: {
				input: {
					batchId: Number(batch.batch_id),
					productId: Number(batch.product_id),
					batchCode: formData.batchCode,
					expirationDate: formData.expirationDate,
					currentQuantityUnits: Number(formData.currentQuantityUnits),
					isActive: formData.isActive,
				},
			},
		});
	};

	return (
		<Fragment>
			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-2 h-full w-full space-y-4 p-4"
			>
				<Typography
					variant="subtitle1"
					fontWeight="bold"
					className="mb-2 text-gray-700 dark:text-gray-300"
				>
					<FormattedMessage id="batch.edit" />
				</Typography>
				<div className="flex flex-row gap-4 justify-center">
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="batch"
								values={{ count: 1 }}
							/>
						</Label>
						<Input
							type="text"
							name="batchCode"
							value={formData.batchCode}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="expiration_date"
								values={{ count: 1 }}
							/>
						</Label>
						<DatePicker
							id="expiration_date"
							placeholder={intl.formatMessage({
								id: "option.select",
							})}
							value={formData.expirationDate.split("T")[0]}
							onChange={handleDateChange}
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="stock"
								values={{ count: 1 }}
							/>
						</Label>
						<Input
							type="number"
							name="currentQuantityUnits"
							min="0"
							value={formData.currentQuantityUnits}
							onChange={handleChange}
							required
						/>
					</div>
				</div>
				<div className="flex flex-row items-center gap-3">
					<Checkbox
						checked={formData.isActive}
						onChange={handleCheckboxChange}
					/>
					<Label>
						<FormattedMessage id="active" values={{ gender: 'male' }} />
					</Label>
				</div>
				<div className="flex justify-end gap-3 mt-4">
					<button
						type="button"
						onClick={onClose}
						disabled={loading}
						className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center gap-2"
					>
						<FormattedMessage id="cancel" />
					</button>
					<button
						type="submit"
						disabled={loading}
						className="px-4 py-2 text-white rounded-xl transition-colors flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300"
					>
						{loading ? (
							<FormattedMessage id="saving" />
						) : (
							<FormattedMessage id="save" />
						)}
					</button>
				</div>
			</form>
		</Fragment>
	);
}
