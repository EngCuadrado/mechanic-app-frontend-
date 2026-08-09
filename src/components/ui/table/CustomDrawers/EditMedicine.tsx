import * as React from "react";
import { Fragment, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation, useQuery } from "@apollo/client/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
	Box,
	Stepper,
	Step,
	StepLabel,
	Typography,
} from "@mui/material";
import { toast } from "sonner";

import Label from "../../../form/Label";
import Select from "../../../form/Select";
import Checkbox from "../../../form/input/Checkbox";
import Input from "../../../form/input/InputField";
import {
	GET_SUPPLIERS_LIST_QUERY,
	GET_PRESENTATION_LIST_QUERY,
	GET_BRANDS_LIST_QUERY,
	GET_MANUFACTURERS_LIST_QUERY,
	GET_CATEGORIES_LIST_QUERY,
	GET_ADMINISTRATION_ROUTES_LIST_QUERY,
	GET_ACTIVE_INGREDIENTS_LIST_QUERY,
	GET_DOSE_UNITS_LIST_QUERY,
	GET_UNIT_OF_MEASURE_LIST_QUERY,
	UPDATE_MEDICINE_MUTATION,
} from "../QuerysDefinitions";

// --- INTERFACES ---

export interface ActiveIngredientInput {
	activeIngredientId: number | string;
	doseValue: number | string;
	doseUnitId: number | string;
}

export interface EditMedicineFormData {
	medicineId: number;
	name: string;
	barcode: string;
	idBrand: string;
	manufacturerId: string;
	categoryId: string;
	administrationRouteId: string;
	requiresPrescription: boolean;

	supplierId: string;
	presentationId: string;
	unitOfMeasureId: string;
	unitsPerPresentation: number | string;
	currency: string;
	costPrice: number | string;
	pricePerUnit: number | string;
	priceFullPresentation: number | string;
	isFractionable: boolean;

	description: string;
	minStockUnits: number | string;
	ingredients: ActiveIngredientInput[];
}

interface StepProps {
	formData: EditMedicineFormData;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	setFormData: React.Dispatch<React.SetStateAction<EditMedicineFormData>>;
}

const stepKeys: string[] = [
	"medicine.step.identification",
	"medicine.step.packaging",
];

// --- COMPONENTES DE CADA PASO ---

function MedicalSpecsStep({ formData, onChange, setFormData }: StepProps) {
	const intl = useIntl();

	const { data: brandsData } = useQuery(GET_BRANDS_LIST_QUERY);
	const brandsOptions = React.useMemo(() => {
		if (!brandsData?.brands?.nodes) return [];
		return brandsData.brands.nodes.map((node: any) => ({
			value: String(node.id_brand),
			label: node.name,
		}));
	}, [brandsData]);

	const { data: manufacturersData } = useQuery(GET_MANUFACTURERS_LIST_QUERY);
	const manufacturersOptions = React.useMemo(() => {
		if (!manufacturersData?.manufacturers?.nodes) return [];
		return manufacturersData.manufacturers.nodes.map((node: any) => ({
			value: String(node.manufacturer_id),
			label: node.name,
		}));
	}, [manufacturersData]);

	const { data: categoriesData } = useQuery(GET_CATEGORIES_LIST_QUERY);
	const categoriesOptions = React.useMemo(() => {
		if (!categoriesData?.categories?.nodes) return [];
		return categoriesData.categories.nodes.map((node: any) => ({
			value: String(node.category_id),
			label: node.name,
		}));
	}, [categoriesData]);

	const { data: administrationRoutesData } = useQuery(
		GET_ADMINISTRATION_ROUTES_LIST_QUERY,
	);
	const administrationRoutesOptions = React.useMemo(() => {
		if (!administrationRoutesData?.administrationRoutes?.nodes) return [];
		return administrationRoutesData.administrationRoutes.nodes.map(
			(node: any) => ({
				value: String(node.administration_route_id),
				label: node.name,
			}),
		);
	}, [administrationRoutesData]);

	const { data: ingredientsData } = useQuery(
		GET_ACTIVE_INGREDIENTS_LIST_QUERY,
	);
	const ingredientsOptions = React.useMemo(() => {
		if (!ingredientsData?.activeIngredients?.nodes) return [];
		return ingredientsData.activeIngredients.nodes.map((node: any) => ({
			value: String(node.active_ingredient_id),
			label: node.name,
		}));
	}, [ingredientsData]);

	const { data: doseUnitsData } = useQuery(GET_DOSE_UNITS_LIST_QUERY);
	const doseUnitsOptions = React.useMemo(() => {
		if (!doseUnitsData?.doseUnits?.nodes) return [];
		return doseUnitsData.doseUnits.nodes.map((node: any) => ({
			value: String(node.dose_unit_id),
			label: `${node.name} (${node.abbreviation})`,
		}));
	}, [doseUnitsData]);

	const handleIngredientChange = (
		index: number,
		field: keyof ActiveIngredientInput,
		value: any,
	) => {
		const newIngredients = [...formData.ingredients];
		newIngredients[index] = { ...newIngredients[index], [field]: value };
		setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
	};

	const addIngredient = () => {
		setFormData((prev) => ({
			...prev,
			ingredients: [
				...prev.ingredients,
				{ activeIngredientId: "", doseValue: "", doseUnitId: "" },
			],
		}));
	};

	const removeIngredient = (index: number) => {
		const newIngredients = formData.ingredients.filter(
			(_, i) => i !== index,
		);
		setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
	};

	const handleSelectChange = (field: keyof EditMedicineFormData, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleCheckboxChange = (
		field: keyof EditMedicineFormData,
		value: boolean,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Fragment>
			<div className="flex flex-col gap-2 h-full w-full">
				<Typography variant="subtitle1" fontWeight="bold" className="mb-2 text-gray-700 dark:text-gray-100">
					<FormattedMessage id="medicine.section.data" />
				</Typography>
				<div className="flex flex-row gap-4 justify-center">
					<div className="w-full">
						<Label><FormattedMessage id="barcode" /></Label>
						<Input type="text" name="barcode" value={formData.barcode} onChange={onChange} />
					</div>
					<div className="w-full">
						<Label><FormattedMessage id="medicines" values={{ count: 1 }} /></Label>
						<Input type="text" name="name" value={formData.name} onChange={onChange} />
					</div>
				</div>
				<div className="flex flex-row gap-4 justify-center">
					<div className="w-full">
						<Label><FormattedMessage id="description" values={{ count: 1 }} /></Label>
						<Input type="text" name="description" value={formData.description} onChange={onChange} />
					</div>
					<div className="w-full">
						<Label><FormattedMessage id="brands" values={{ count: 1 }} /></Label>
						<Select
							options={brandsOptions}
							placeholder={intl.formatMessage({ id: "option.select" })}
							value={formData.idBrand}
							onChange={(val) => handleSelectChange("idBrand", val)}
							className="dark:bg-dark-900"
						/>
					</div>
				</div>
				<div className="flex flex-row gap-4 justify-center">
					<div className="w-full">
						<Label><FormattedMessage id="manufacturers" values={{ count: 1 }} /></Label>
						<Select
							options={manufacturersOptions}
							placeholder={intl.formatMessage({ id: "option.select" })}
							value={formData.manufacturerId}
							onChange={(val) => handleSelectChange("manufacturerId", val)}
							className="dark:bg-dark-900"
						/>
					</div>
					<div className="w-full">
						<Label><FormattedMessage id="categories" values={{ count: 1 }} /></Label>
						<Select
							options={categoriesOptions}
							placeholder={intl.formatMessage({ id: "option.select" })}
							value={formData.categoryId}
							onChange={(val) => handleSelectChange("categoryId", val)}
							className="dark:bg-dark-900"
						/>
					</div>
					<div className="w-full">
						<Label><FormattedMessage id="administration_routes" values={{ count: 1 }} /></Label>
						<Select
							options={administrationRoutesOptions}
							placeholder={intl.formatMessage({ id: "option.select" })}
							value={formData.administrationRouteId}
							onChange={(val) => handleSelectChange("administrationRouteId", val)}
							className="dark:bg-dark-900"
						/>
					</div>
				</div>
				<div className="flex flex-row gap-4 justify-center">
					<div className="flex w-full justify-start">
						<div className="flex flex-row h-full w-full gap-3 items-center justify-center">
							<Checkbox
								checked={formData.requiresPrescription}
								onChange={(val) => handleCheckboxChange("requiresPrescription", val)}
							/>
							<Label><FormattedMessage id="requires.prescription" /></Label>
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-6 h-full w-full mt-4">
					<Typography variant="subtitle1" fontWeight="bold" className="mb-2 text-gray-700 dark:text-gray-100">
						<FormattedMessage id="medicine.section.formula" />
					</Typography>
					{formData.ingredients.map((ingredient, index) => (
						<div key={index} className="flex flex-row gap-3 items-end mb-4">
							<div className="w-full">
								<Label><FormattedMessage id="active_ingredient" /></Label>
								<Select
									options={ingredientsOptions}
									placeholder={intl.formatMessage({ id: "option.select" })}
									value={String(ingredient.activeIngredientId)}
									onChange={(val) => handleIngredientChange(index, "activeIngredientId", val)}
								/>
							</div>
							<div className="w-full">
								<Label><FormattedMessage id="dose" /></Label>
								<Input
									type="number"
									min="0"
									value={ingredient.doseValue as number}
									onChange={(e) => handleIngredientChange(index, "doseValue", e.target.value)}
								/>
							</div>
							<div className="w-full">
								<Label><FormattedMessage id="unit" /></Label>
								<Select
									options={doseUnitsOptions}
									placeholder={intl.formatMessage({ id: "option.select" })}
									value={String(ingredient.doseUnitId)}
									onChange={(val) => handleIngredientChange(index, "doseUnitId", val)}
								/>
							</div>
							<div className="w-full pb-1">
								{formData.ingredients.length > 1 && (
									<button
										type="button"
										onClick={() => removeIngredient(index)}
										className="p-3 text-red-600 dark:text-red-50 border border-red-300 rounded-full bg-red-50 dark:bg-red-900 transition-colors flex items-center justify-center"
									>
										<TrashIcon className="size-4" />
									</button>
								)}
							</div>
						</div>
					))}
					<button
						type="button"
						onClick={addIngredient}
						className="mt-1 px-4 py-2 text-brand-500 border border-brand-500 dark:border-gray-400 dark:text-gray-400 rounded-xl hover:bg-brand-50 transition-colors flex items-center justify-center gap-2 w-max"
					>
						<FormattedMessage id="medicine.action.add_ingredient" />
					</button>
				</div>
			</div>
		</Fragment>
	);
}

function GeneralInfoStep({ formData, onChange, setFormData }: StepProps) {
	const intl = useIntl();
	const { data: suppliersData } = useQuery(GET_SUPPLIERS_LIST_QUERY);
	const suppliersOptions = React.useMemo(() => {
		if (!suppliersData?.suppliers?.nodes) return [];
		return suppliersData.suppliers.nodes.map((node: any) => ({
			value: String(node.supplier_id),
			label: node.company_name,
		}));
	}, [suppliersData]);

	const { data: presentationsData } = useQuery(GET_PRESENTATION_LIST_QUERY);
	const presentationsOptions = React.useMemo(() => {
		if (!presentationsData?.presentations?.nodes) return [];
		return presentationsData.presentations.nodes.map((node: any) => ({
			value: String(node.presentation_id),
			label: node.name,
		}));
	}, [presentationsData]);

	const { data: unitOfMeasureData } = useQuery(GET_UNIT_OF_MEASURE_LIST_QUERY);
	const unitOfMeasureOptions = React.useMemo(() => {
		if (!unitOfMeasureData?.unitOfMeasures?.nodes) return [];
		return unitOfMeasureData.unitOfMeasures.nodes.map((node: any) => ({
			value: String(node.unit_of_measure_id),
			label: node.name,
		}));
	}, [unitOfMeasureData]);

	const handleSelectChange = (field: keyof EditMedicineFormData, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleCheckboxChange = (field: keyof EditMedicineFormData, value: boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Fragment>
			<div className="flex flex-col gap-2 h-full w-full space-y-4">
				<Typography variant="subtitle1" fontWeight="bold" className="mb-2 text-gray-700">
					<FormattedMessage id="medicine.step.packaging" />
				</Typography>
				<div className="flex flex-row gap-4 justify-center">
					<div className="w-full">
						<Label><FormattedMessage id="suppliers" values={{ count: 1 }} /></Label>
						<Select
							options={suppliersOptions}
							placeholder={intl.formatMessage({ id: "option.select" })}
							value={formData.supplierId}
							onChange={(val) => handleSelectChange("supplierId", val)}
							className="dark:bg-dark-900"
						/>
					</div>
					<div className="w-full">
						<Label><FormattedMessage id="presentations" values={{ count: 1 }} /></Label>
						<Select
							options={presentationsOptions}
							placeholder={intl.formatMessage({ id: "option.select" })}
							value={formData.presentationId}
							onChange={(val) => handleSelectChange("presentationId", val)}
							className="dark:bg-dark-900"
						/>
					</div>
					<div className="w-full">
						<Label><FormattedMessage id="unit_of_measures" values={{ count: 1 }} /></Label>
						<Select
							options={unitOfMeasureOptions}
							placeholder={intl.formatMessage({ id: "option.select" })}
							value={formData.unitOfMeasureId}
							onChange={(val) => handleSelectChange("unitOfMeasureId", val)}
							className="dark:bg-dark-900"
						/>
					</div>
					<div className="w-full">
						<Label><FormattedMessage id="units_per_presentation" values={{ count: 1 }} /></Label>
						<Input type="number" min="1" name="unitsPerPresentation" value={formData.unitsPerPresentation} onChange={onChange} />
					</div>
				</div>
				<div className="flex flex-row gap-4 justify-center">
					<div className="w-full">
						<Label><FormattedMessage id="cost_price" /></Label>
						<Input type="number" min="0" name="costPrice" value={formData.costPrice} onChange={onChange} />
					</div>
					<div className="w-full">
						<Label><FormattedMessage id="price_full_presentation" values={{ count: 1 }} /></Label>
						<Input type="number" min="1" name="priceFullPresentation" value={formData.priceFullPresentation} onChange={onChange} />
					</div>
					<div className="flex flex-row h-full w-full gap-3 items-center justify-center">
						<Checkbox
							checked={formData.isFractionable}
							onChange={(val) => handleCheckboxChange("isFractionable", val)}
						/>
						<Label><FormattedMessage id="is_fractionable" /></Label>
					</div>
					{!!formData.isFractionable && (
						<div className="w-full">
							<Label><FormattedMessage id="price_per_unit" values={{ count: 1 }} /></Label>
							<Input type="number" min="1" name="pricePerUnit" value={formData.pricePerUnit} onChange={onChange} />
						</div>
					)}
				</div>
				<div className="flex flex-row gap-4 justify-center">
					<div className="w-full">
						<Label><FormattedMessage id="min_stock_units" values={{ count: 1 }} /></Label>
						<Input type="number" name="minStockUnits" min="0" value={formData.minStockUnits} onChange={onChange} />
					</div>
					<div className="w-full"></div>
				</div>
			</div>
		</Fragment>
	);
}

// --- COMPONENTE PRINCIPAL ---

export default function EditMedicine({
	row,
	onClose,
}: {
	row: any;
	onClose: () => void;
}) {
	const intl = useIntl();
	const medicine = row.original;
	const product = medicine.product;

	const [activeStep, setActiveStep] = React.useState<number>(0);

	const [updateMedicine, { loading: isSubmitting }] = useMutation(
		UPDATE_MEDICINE_MUTATION,
		{
			refetchQueries: ["GetMedicineTherapeuticDetails"],
			awaitRefetchQueries: true,
		},
	);

	const [formData, setFormData] = React.useState<EditMedicineFormData>({
		medicineId: parseInt(medicine.medicine_id),
		name: medicine.name || "",
		barcode: product?.barcode || "",
		idBrand: String(medicine.brand?.id_brand || ""),
		manufacturerId: String(medicine.manufacturer?.manufacturer_id || ""),
		categoryId: String(medicine.category?.category_id || ""),
		administrationRouteId: String(medicine.administration_route?.administration_route_id || ""),
		requiresPrescription: Boolean(medicine.requires_prescription),

		supplierId: String(product?.supplier_id || ""),
		presentationId: String(product?.presentation_id || ""),
		unitOfMeasureId: String(product?.unit_of_measure_id || ""),
		unitsPerPresentation: product?.units_per_presentation || "",
		currency: product?.currency || "NIO",
		costPrice: product?.cost_price || "",
		pricePerUnit: product?.price_per_unit || "",
		priceFullPresentation: product?.price_full_presentation || "",
		isFractionable: Boolean(product?.is_fractionable),

		description: medicine.description || "",
		minStockUnits: product?.min_stock_units || "",
		ingredients: medicine.medicine_active_ingredients?.map((ing: any) => ({
			activeIngredientId: String(ing.active_ingredient_id),
			doseValue: ing.dose_value,
			doseUnitId: String(ing.dose_unit_id),
		})) || [],
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleNext = () => {
		if (activeStep === stepKeys.length - 1) {
			submitToAPI();
		} else {
			setActiveStep((prev) => prev + 1);
		}
	};

	const handleBack = () => {
		setActiveStep((prev) => prev - 1);
	};

	const submitToAPI = async () => {
		const input = {
			medicineId: formData.medicineId,
			name: formData.name,
			barcode: formData.barcode,
			idBrand: parseInt(formData.idBrand, 10) || 0,
			manufacturerId: parseInt(formData.manufacturerId, 10) || 0,
			categoryId: parseInt(formData.categoryId, 10) || 0,
			administrationRouteId: parseInt(formData.administrationRouteId, 10) || 0,
			requiresPrescription: Boolean(formData.requiresPrescription),

			supplierId: parseInt(formData.supplierId, 10) || 0,
			presentationId: parseInt(formData.presentationId, 10) || 0,
			unitOfMeasureId: parseInt(formData.unitOfMeasureId, 10) || 0,
			unitsPerPresentation: parseInt(String(formData.unitsPerPresentation), 10) || 0,

			currency: formData.currency,
			costPrice: parseFloat(String(formData.costPrice)) || 0,
			pricePerUnit: formData.isFractionable ? parseFloat(String(formData.pricePerUnit)) || 0 : 0,
			priceFullPresentation: parseFloat(String(formData.priceFullPresentation)) || 0,
			isFractionable: Boolean(formData.isFractionable),

			description: formData.description || "",
			minStockUnits: parseInt(String(formData.minStockUnits), 10) || 0,

			ingredients: formData.ingredients.map((ing) => ({
				activeIngredientId: parseInt(String(ing.activeIngredientId), 10) || 0,
				doseValue: parseFloat(String(ing.doseValue)) || 0,
				doseUnitId: parseInt(String(ing.doseUnitId), 10) || 0,
			})),
		};

		try {
			const { data } = await updateMedicine({ variables: { input } });

			if (data?.updateMedicine?.result) {
				toast.success(
					data.updateMedicine.message ||
						intl.formatMessage({ id: "medicine.success.update" }),
				);
				onClose();
			} else {
				toast.error(
					data?.updateMedicine?.message ||
						intl.formatMessage({ id: "medicine.error.update" }),
				);
			}
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	const isStepValid = (): boolean => {
		if (activeStep === 0) {
			return (
				!!formData.name &&
				!!formData.idBrand &&
				!!formData.manufacturerId &&
				!!formData.categoryId &&
				!!formData.administrationRouteId &&
				formData.ingredients.length > 0 &&
				formData.ingredients.every(
					(ing) => !!ing.activeIngredientId && !!ing.doseValue && !!ing.doseUnitId,
				)
			);
		}
		if (activeStep === 1) {
			const baseValid =
				!!formData.supplierId &&
				!!formData.presentationId &&
				!!formData.unitOfMeasureId &&
				!!formData.unitsPerPresentation &&
				!!formData.costPrice &&
				!!formData.priceFullPresentation;

			if (formData.isFractionable) {
				return baseValid && !!formData.pricePerUnit;
			}
			return baseValid;
		}
		return false;
	};

	const getStepContent = (step: number): React.ReactNode => {
		switch (step) {
			case 0:
				return <MedicalSpecsStep formData={formData} onChange={handleChange} setFormData={setFormData} />;
			case 1:
				return <GeneralInfoStep formData={formData} onChange={handleChange} setFormData={setFormData} />;
			default:
				return <Typography><FormattedMessage id="medicine.error.unknown_step" /></Typography>;
		}
	};

	return (
		<Box className="p-3">
<Stepper className="m-4" activeStep={activeStep} alternativeLabel>
    {stepKeys.map((key) => (
        <Step key={key}>
            <StepLabel
                sx={{
                    // 1. Color del texto INACTIVO (ej: "Empaque y Precios")
                    '& .MuiStepLabel-label': {
                        color: '#94a3b8', // Un gris claro para que resalte en el fondo oscuro
                    },
                    // 2. Color del texto ACTIVO
                    '& .MuiStepLabel-label.Mui-active': {
                        color: '#ffffff', // Blanco
                    },
                    // 3. Color del texto COMPLETADO
                    '& .MuiStepLabel-label.Mui-completed': {
                        color: '#cbd5e1', // Gris intermedio
                    },
                    // 4. Color del círculo INACTIVO
                    '& .MuiStepIcon-root': {
                        color: '#1e293b', // Un gris muy oscuro que coincida con tus inputs
                    },
                    // 5. Color del círculo ACTIVO y COMPLETADO
                    '& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed': {
                        color: '#3b82f6', // El color azul que ya tienes
                    },
                    // 6. Color del número dentro del círculo
                    '& .MuiStepIcon-text': {
                        fill: '#ffffff', // Blanco para que el número sea visible
                    }
                }}
            >
                <FormattedMessage id={key} />
            </StepLabel>
        </Step>
    ))}
</Stepper>

			<Fragment>
				{getStepContent(activeStep)}

				<div className="flex flex-row gap-2 items-end justify-end mt-5">
					<button
						type="button"
						disabled={activeStep === 0 || isSubmitting}
						onClick={handleBack}
						className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
					>
						<FormattedMessage id="common.back" />
					</button>
					<button
						type="button"
						onClick={handleNext}
						disabled={!isStepValid() || isSubmitting}
						className="px-4 py-2 text-white rounded-xl transition-colors bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
					>
						{isSubmitting
							? intl.formatMessage({ id: "common.sending" })
							: activeStep === stepKeys.length - 1
								? intl.formatMessage({ id: "common.send_api" })
								: intl.formatMessage({ id: "common.next" })}
					</button>
				</div>
			</Fragment>
		</Box>
	);
}
