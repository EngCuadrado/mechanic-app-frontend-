import * as React from "react";
import { Fragment, useState, useMemo } from "react";
import { Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import DatePicker from "../../../form/date-picker";
import { useMutation } from "@apollo/client/react";
import { ADD_BATCH_MUTATION } from "../QuerysDefinitions";
import { toast } from "sonner";
import { nicaDate, nowInNica } from "../../../../utils/dateUtils";

export default function AddNewBatch({
	productId,
	onClose,
}: {
	productId: number;
	onClose?: () => void;
}) {
	const intl = useIntl();
	// Calcular la fecha por defecto (hoy + 10 meses)
	const defaultDateObj = useMemo(() => {
		return nowInNica().add(10, "month");
	}, []);

	const formatToISO = (date: any) => {
		return nicaDate(date).startOf("day").toISOString();
	};

	const [formData, setFormData] = useState({
		batchCode: "",
		expirationDate: formatToISO(defaultDateObj),
		quantityUnits: 0,
	});

	const [addBatch, { loading }] = useMutation(ADD_BATCH_MUTATION, {
		onCompleted: (data) => {
			if (data.addBatch.result) {
				toast.success(
					data.addBatch.message ||
						intl.formatMessage({ id: "batch.create.success" }),
				);
				onClose?.();
			} else {
				toast.error(
					data.addBatch.message ||
						intl.formatMessage({ id: "batch.create.error" }),
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
			[name]: name === "quantityUnits" ? parseInt(value) || 0 : value,
		}));
	};

	const handleDateChange = (selectedDates: Date[]) => {
		if (selectedDates.length > 0) {
			const date = selectedDates[0];

			// Validar que tenga al menos 10 meses de vida útil
			const minDate = nowInNica().add(10, "month").startOf("day");
			const compareDate = nicaDate(date).startOf("day");

			if (compareDate.isBefore(minDate)) {
				toast.error(
					intl.formatMessage({ id: "batch.error.min_shelf_life" }),
				);
				// Revertir a la fecha por defecto si la seleccionada es inválida
				setFormData((prev) => ({
					...prev,
					expirationDate: formatToISO(defaultDateObj),
				}));
				return;
			}

			setFormData((prev) => ({
				...prev,
				expirationDate: formatToISO(date),
			}));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.batchCode ||
			!formData.expirationDate ||
			formData.quantityUnits <= 0
		) {
			toast.error(intl.formatMessage({ id: "error.incompleteParams" }));
			return;
		}

		addBatch({
			variables: {
				input: {
					productId: Number(productId),
					batchCode: formData.batchCode,
					expirationDate: formData.expirationDate,
					quantityUnits: Number(formData.quantityUnits),
				},
			},
		});
	};

	return (
		<Fragment>
			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-2 h-full w-full space-y-4"
			>
				<Typography
					variant="subtitle1"
					fontWeight="bold"
					className="mb-2 text-gray-700 dark:text-gray-300"
				>
					<FormattedMessage id="medicine.step.batch" />
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
							placeholder={intl.formatMessage({
								id: "batch.code_placeholder",
							})}
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
							value={formData.expirationDate.split("T")[0]} // Pasar solo YYYY-MM-DD al flatpickr
							onChange={handleDateChange}
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="units"
								values={{ count: 1 }}
							/>
						</Label>
						<Input
							type="number"
							name="quantityUnits"
							min="1"
							value={formData.quantityUnits}
							onChange={handleChange}
							placeholder={intl.formatMessage(
								{ id: "units" },
								{ count: 2 },
							)}
							required
						/>
					</div>
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
