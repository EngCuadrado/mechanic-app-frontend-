import * as React from "react";
import { Fragment, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useQuery } from "@apollo/client/react"; // Cambiamos fetch por useQuery
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

import {
	Box,
	Stepper,
	Step,
	StepLabel,
	Typography,
	TextField,
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
	GET_MEDICINE_QUERY,
} from "../QuerysDefinitions";
import DatePicker from "../../../form/date-picker";

// --- QUERIES Y MUTACIONES ---

const ADD_MEDICINE_MUTATION = gql`
	mutation AddMedicine($input: AddMedicineInput!) {
		addMedicine(input: $input) {
			result
			message
		}
	}
`;

// --- INTERFACES DE TYPESCRIPT ---

export interface ActiveIngredientInput {
	active_ingredient_id: number | string;
	dose_value: number | string;
	dose_unit_id: number | string;
}

export interface MedicineFormData {
	name: string;
	barcode: string;
	id_brand: string;
	manufacturer_id: string;
	category_id: string;
	administration_route_id: string;
	requires_prescription: boolean;

	supplier_id: string;
	presentation_id: string;
	unit_of_measure_id: string;
	units_per_presentation: number | string;
	currency: string;
	cost_price: number | string;
	price_per_unit: number | string;
	price_full_presentation: number | string;
	is_fractionable: boolean;

	description: string;
	batch_code: string;
	expiration_date: string;
	units: number | string;
	stock_units: number | string;
	min_stock_units: number | string;
	ingredients: ActiveIngredientInput[];
}

// 2. Define las props que recibirán los sub-componentes
interface StepProps {
	formData: MedicineFormData;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	setFormData: React.Dispatch<React.SetStateAction<MedicineFormData>>; // Importante para arreglos
}

const stepKeys: string[] = [
	"medicine.step.identification",
	"medicine.step.packaging",
	"medicine.step.batch",
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
				value: String(node.administration_route_id || node.category_id),
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
			label: `${node.name} (${node.abbreviation})`, // Ej: Miligramo (mg)
		}));
	}, [doseUnitsData]);

	// 2. Funciones para manejar el Arreglo Dinámico
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
				{ active_ingredient_id: "", dose_value: "", dose_unit_id: "" },
			],
		}));
	};

	const removeIngredient = (index: number) => {
		const newIngredients = formData.ingredients.filter(
			(_, i) => i !== index,
		);
		setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
	};

	// Función dinámica para actualizar cualquier select en el padre
	const handleSelectChange = (field: keyof MedicineFormData, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleCheckboxChange = (
		field: keyof MedicineFormData,
		value: boolean,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Fragment>
			<div className="flex flex-col gap-2 h-full w-full">
				<Typography
					variant="subtitle1"
					fontWeight="bold"
					className="mb-2 text-gray-700 dark:text-gray-100"
				>
					<FormattedMessage id="medicine.section.data" />
				</Typography>
				<div className="flex flex-row gap-4 justify-center  ">
					<div className="w-full">
						<Label>
							<FormattedMessage id="barcode" />
						</Label>
						<Input
							type="text"
							name="barcode"
							value={formData.barcode}
							onChange={onChange}
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="medicines"
								values={{ count: 1 }}
							/>
						</Label>
						<Input
							type="text"
							name="name"
							value={formData.name}
							onChange={onChange}
						/>
					</div>
				</div>
				<div className="flex flex-row gap-4 justify-center  ">
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="description"
								values={{ count: 1 }}
							/>
						</Label>
						<Input
							type="text"
							name="description"
							value={formData.description}
							onChange={onChange}
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="brands"
								values={{ count: 1 }}
							/>
						</Label>
						<Select
							options={brandsOptions}
							placeholder={intl.formatMessage({
								id: "option.select",
							})}
							value={formData.id_brand}
							onChange={(val) =>
								handleSelectChange("id_brand", val)
							}
							className="dark:bg-dark-900"
						/>
					</div>
				</div>
				<div className="flex flex-row gap-4 justify-center  ">
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="manufacturers"
								values={{ count: 1 }}
							/>
						</Label>
						<Select
							options={manufacturersOptions}
							placeholder={intl.formatMessage({
								id: "option.select",
							})}
							value={formData.manufacturer_id}
							onChange={(val) =>
								handleSelectChange("manufacturer_id", val)
							}
							className="dark:bg-dark-900"
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="categories"
								values={{ count: 1 }}
							/>
						</Label>
						<Select
							options={categoriesOptions}
							placeholder={intl.formatMessage({
								id: "option.select",
							})}
							value={formData.category_id}
							onChange={(val) =>
								handleSelectChange("category_id", val)
							}
							className="dark:bg-dark-900"
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="administration_routes"
								values={{ count: 1 }}
							/>
						</Label>
						<Select
							options={administrationRoutesOptions}
							placeholder={intl.formatMessage({
								id: "option.select",
							})}
							value={formData.administration_route_id}
							onChange={(val) =>
								handleSelectChange(
									"administration_route_id",
									val,
								)
							}
							className="dark:bg-dark-900"
						/>
					</div>
				</div>
				<div className="flex flex-row gap-4 justify-center  ">
					<div className="flex w-full justify-start">
						<div className="flex flex-row h-full w-full gap-3 items-center justify-center">
							<Checkbox
								checked={formData.requires_prescription}
								onChange={(val) =>
									handleCheckboxChange(
										"requires_prescription",
										val,
									)
								}
							/>
							<Label>
								<FormattedMessage id="requires.prescription" />
							</Label>
						</div>
					</div>
				</div>
				<div className="flex flex-row gap-4 justify-center  ">
					<div className="w-full">
						<div className="flex flex-col gap-6 h-full w-full mt-4">
							{/* --- SECCIÓN DE COMPOSICIÓN DINÁMICA --- */}
							<div>
								<Typography
									variant="subtitle1"
									fontWeight="bold"
									className="mb-2 text-gray-700 dark:text-gray-100"
								>
									<FormattedMessage id="medicine.section.formula" />
								</Typography>

								{formData.ingredients.map(
									(ingredient, index) => (
										<div
											key={index}
											className="flex flex-row gap-3 items-end mb-4"
										>
											<div className="w-full">
												<Label>
													<FormattedMessage id="active_ingredient" />
												</Label>
												<Select
													options={ingredientsOptions}
													placeholder={intl.formatMessage(
														{ id: "option.select" },
													)}
													value={String(
														ingredient.active_ingredient_id,
													)}
													onChange={(val) =>
														handleIngredientChange(
															index,
															"active_ingredient_id",
															val,
														)
													}
												/>
											</div>

											<div className="w-full">
												<Label>
													<FormattedMessage id="dose" />
												</Label>
												<Input
													type="number"
													min="0"
													value={
														ingredient.dose_value as number
													}
													onChange={(e) =>
														handleIngredientChange(
															index,
															"dose_value",
															e.target.value,
														)
													}
												/>
											</div>

											<div className="w-full">
												<Label>
													<FormattedMessage id="unit" />
												</Label>
												<Select
													options={doseUnitsOptions}
													placeholder={intl.formatMessage(
														{ id: "option.select" },
													)}
													value={String(
														ingredient.dose_unit_id,
													)}
													onChange={(val) =>
														handleIngredientChange(
															index,
															"dose_unit_id",
															val,
														)
													}
												/>
											</div>

											{/* Botón para eliminar fila (solo si hay más de 1) */}
											<div className="w-full pb-1">
												{formData.ingredients.length >
													1 && (
													<button
														type="button"
														onClick={() =>
															removeIngredient(
																index,
															)
														}
														className="p-3 text-red-600 dark:text-red-50 border border-red-300 rounded-full bg-red-50 dark:bg-red-900 transition-colors flex items-center justify-center"
													>
														<TrashIcon className="size-4" />
													</button>
												)}
											</div>
										</div>
									),
								)}

								{/* Botón para agregar una nueva fila */}
								<button
									type="button"
									onClick={addIngredient}
									className="mt-1 px-4 py-2 text-brand-500 border border-brand-500 dark:border-gray-400 dark:text-gray-400 rounded-xl hover:bg-brand-50 transition-colors flex items-center justify-center gap-2 w-max"
								>
									<FormattedMessage id="medicine.action.add_ingredient" />
								</button>
							</div>
						</div>
					</div>
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

	const { data: unitOfMeasureData } = useQuery(
		GET_UNIT_OF_MEASURE_LIST_QUERY,
	);
	const unitOfMeasureOptions = React.useMemo(() => {
		if (!unitOfMeasureData?.unitOfMeasures?.nodes) return [];
		return unitOfMeasureData.unitOfMeasures.nodes.map((node: any) => ({
			value: String(node.unit_of_measure_id),
			label: node.name,
		}));
	}, [unitOfMeasureData]);

	// Función dinámica para actualizar cualquier select en el padre
	const handleSelectChange = (field: keyof MedicineFormData, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleCheckboxChange = (
		field: keyof MedicineFormData,
		value: boolean,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Fragment>
			<div className="flex flex-col gap-2 h-full w-full space-y-4">
				<Typography
					variant="subtitle1"
					fontWeight="bold"
					className="mb-2 text-gray-700 dark:text-gray-100"
				>
					<FormattedMessage id="medicine.step.packaging" />
				</Typography>
				<div className="flex flex-row gap-4 justify-center  ">
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="suppliers"
								values={{ count: 1 }}
							/>
						</Label>
						<Select
							options={suppliersOptions}
							placeholder={intl.formatMessage({
								id: "option.select",
							})}
							value={formData.supplier_id}
							onChange={(val) =>
								handleSelectChange("supplier_id", val)
							}
							className="dark:bg-dark-900"
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="presentations"
								values={{ count: 1 }}
							/>
						</Label>
						<Select
							options={presentationsOptions}
							placeholder={intl.formatMessage({
								id: "option.select",
							})}
							value={formData.presentation_id}
							onChange={(val) =>
								handleSelectChange("presentation_id", val)
							}
							className="dark:bg-dark-900"
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="unit_of_measures"
								values={{ count: 1 }}
							/>
						</Label>
						<Select
							options={unitOfMeasureOptions}
							placeholder={intl.formatMessage({
								id: "option.select",
							})}
							value={formData.unit_of_measure_id}
							onChange={(val) =>
								handleSelectChange("unit_of_measure_id", val)
							}
							className="dark:bg-dark-900"
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="units_per_presentation"
								values={{ count: 1 }}
							/>
						</Label>
						<Input
							type="number"
							min="1"
							name="units_per_presentation"
							value={formData.units_per_presentation}
							onChange={onChange}
						/>
					</div>
				</div>
				<div className="flex flex-row gap-4 justify-center  ">
					<div className="w-full">
						<Label>
							<FormattedMessage id="cost_price" />
						</Label>
						<Input
							type="number"
							min="0"
							name="cost_price"
							value={formData.cost_price}
							onChange={onChange}
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="price_full_presentation"
								values={{ count: 1 }}
							/>
						</Label>
						<Input
							type="number"
							min="1"
							name="price_full_presentation"
							value={formData.price_full_presentation}
							onChange={onChange}
						/>
					</div>
					<div className="flex flex-row h-full w-full gap-3 items-center justify-center">
						<Checkbox
							checked={formData.is_fractionable}
							onChange={(val) =>
								handleCheckboxChange("is_fractionable", val)
							}
						/>
						<Label>
							<FormattedMessage id="is_fractionable" />
						</Label>
					</div>
					{!!formData.is_fractionable && (
						<div className="w-full">
							<Label>
								<FormattedMessage
									id="price_per_unit"
									values={{ count: 1 }}
								/>
							</Label>
							<Input
								type="number"
								min="1"
								name="price_per_unit"
								value={formData.price_per_unit}
								onChange={onChange}
							/>
						</div>
					)}
				</div>
			</div>
		</Fragment>
	);
}

function CompositionStep({ formData, onChange, setFormData }: StepProps) {
	const intl = useIntl();
	// Función dinámica para actualizar cualquier select/date en el padre
	const handleSelectChange = (field: keyof MedicineFormData, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const suggestedMinStock = Math.ceil(
		(Number(formData.stock_units) || 0) * 0.15,
	);

	return (
		<Fragment>
			<div className="flex flex-col gap-2 h-full w-full space-y-4">
				<Typography
					variant="subtitle1"
					fontWeight="bold"
					className="mb-2 text-gray-700 dark:text-gray-100"
				>
					<FormattedMessage id="medicine.step.batch" />
				</Typography>
				<div className="flex flex-row gap-4 justify-center  ">
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="batch"
								values={{ count: 1 }}
							/>
						</Label>
						<Input
							type="text"
							name="batch_code"
							value={formData.batch_code}
							onChange={onChange}
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
							value={formData.expiration_date}
							onChange={(_, currentDateString) => {
								handleSelectChange(
									"expiration_date",
									currentDateString,
								);
							}}
						/>
					</div>
				</div>
				<div className="flex flex-row gap-4 justify-center  ">
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="units"
								values={{ count: 1 }}
							/>
						</Label>
						<Input
							type="number"
							name="units"
							min="0"
							value={formData.units}
							onChange={onChange}
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="stock_units"
								values={{ count: 1 }}
							/>
						</Label>
						<Input
							type="number"
							name="stock_units"
							min="0"
							disabled={true}
							value={formData.stock_units || "0"}
							onChange={onChange}
						/>
					</div>
					<div className="w-full">
						<Label>
							<FormattedMessage
								id="min_stock_units"
								values={{ count: 1 }}
							/>
						</Label>
						<Input
							type="number"
							name="min_stock_units"
							min="0"
							value={formData.min_stock_units}
							placeholder={String(suggestedMinStock)}
							onChange={onChange}
						/>
					</div>
				</div>
				<div className="flex flex-row gap-4 justify-center"></div>
			</div>
		</Fragment>
	);
}

// --- COMPONENTE PRINCIPAL ---
import dayjs from "../../../../utils/dateUtils";

export default function AddNewMedicine({ onClose }: { onClose?: () => void }) {
	const intl = useIntl();
	const [activeStep, setActiveStep] = React.useState<number>(0);

	const [addMedicine, { loading: isSubmitting }] = useMutation(
		ADD_MEDICINE_MUTATION,
		{
			refetchQueries: [{ query: GET_MEDICINE_QUERY() }],
		},
	);

	const defaultExpirationDate = dayjs().format("YYYY-MM-DD");

	// Tipamos el estado inicial con la interfaz MedicineFormData
	const [formData, setFormData] = React.useState<MedicineFormData>({
		name: "",
		barcode: "",
		id_brand: "",
		manufacturer_id: "",
		category_id: "",
		administration_route_id: "",
		requires_prescription: false,

		supplier_id: "",
		presentation_id: "",
		unit_of_measure_id: "",
		units_per_presentation: "",
		currency: "USD",
		cost_price: "",
		price_per_unit: "",
		price_full_presentation: "",
		is_fractionable: false,

		description: "",
		batch_code: "",
		expiration_date: "",
		units: "",
		stock_units: "",
		min_stock_units: "",
		ingredients: [
			{ active_ingredient_id: "", dose_value: "", dose_unit_id: "" },
		],
	});

	// Tipamos el evento del input para que TypeScript sepa que e.target.name y e.target.value existen
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	// Auto-calculate stock units and min stock units
	React.useEffect(() => {
		const units = Number(formData.units) || 0;
		const unitsPerPresentation =
			Number(formData.units_per_presentation) || 0;

		if (units >= 0 && unitsPerPresentation >= 0) {
			const totalStock = units * unitsPerPresentation;
			const minStock = Math.ceil(totalStock * 0.15); // 15% as requested

			setFormData((prev) => {
				// Only update if values actually changed to avoid infinite loops
				if (
					prev.stock_units !== totalStock ||
					prev.min_stock_units !== minStock
				) {
					return {
						...prev,
						stock_units: totalStock,
						min_stock_units: minStock,
					};
				}
				return prev;
			});
		}
	}, [formData.units, formData.units_per_presentation]);

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

	const handleReset = () => {
		setActiveStep(0);
		setFormData({
			name: "",
			barcode: "",
			id_brand: "",
			manufacturer_id: "",
			category_id: "",
			administration_route_id: "",
			requires_prescription: false,

			supplier_id: "",
			presentation_id: "",
			unit_of_measure_id: "",
			units_per_presentation: "",
			currency: "NIO",
			cost_price: "",
			price_per_unit: "",
			price_full_presentation: "",
			is_fractionable: false,

			description: "",
			batch_code: "",
			expiration_date: "",
			units: "",
			stock_units: "",
			min_stock_units: "",
			ingredients: [
				{ active_ingredient_id: "", dose_value: "", dose_unit_id: "" },
			],
		});
	};

	const submitToAPI = async () => {
		// 1. Aplicamos lógica de stock mínimo asegurándonos de que sea un número válido
		const finalMinStock =
			formData.min_stock_units === ""
				? Math.ceil((Number(formData.stock_units) || 0) * 0.15)
				: Number(formData.min_stock_units);

		// 2. Construimos el objeto garantizando tipos estrictos para GraphQL
		const input = {
			name: formData.name,
			barcode: formData.barcode,
			idBrand: parseInt(String(formData.id_brand), 10) || 0,
			manufacturerId: parseInt(String(formData.manufacturer_id), 10) || 0,
			categoryId: parseInt(String(formData.category_id), 10) || 0,
			administrationRouteId:
				parseInt(String(formData.administration_route_id), 10) || 0,
			requiresPrescription: Boolean(formData.requires_prescription),

			supplierId: parseInt(String(formData.supplier_id), 10) || 0,
			presentationId: parseInt(String(formData.presentation_id), 10) || 0,
			unitOfMeasureId:
				parseInt(String(formData.unit_of_measure_id), 10) || 0,
			unitsPerPresentation:
				parseInt(String(formData.units_per_presentation), 10) || 0,

			currency: formData.currency,
			costPrice: parseFloat(String(formData.cost_price)) || 0,

			// Usamos 'undefined' o '0' en vez de 'null'. Apollo Client filtrará los campos 'undefined'
			// y GraphQL aplicará sus valores por defecto o los ignorará correctamente.
			pricePerUnit: formData.is_fractionable
				? parseFloat(String(formData.price_per_unit)) || 0
				: 0,
			priceFullPresentation:
				parseFloat(String(formData.price_full_presentation)) || 0,
			isFractionable: Boolean(formData.is_fractionable),

			description:
				formData.description ||
				intl.formatMessage({ id: "medicine.description.default" }),

			batchCode: formData.batch_code,
			expirationDate: formData.expiration_date
				? dayjs(formData.expiration_date, [
						"YYYY-MM-DD",
						"DD/MM/YYYY",
					]).toISOString()
				: undefined,

			units: parseInt(String(formData.units), 10) || 0,
			stockUnits: parseInt(String(formData.stock_units), 10) || 0,
			minStockUnits: finalMinStock || 0,

			ingredients: formData.ingredients.map((ing) => ({
				activeIngredientId:
					parseInt(String(ing.active_ingredient_id), 10) || 0,
				doseValue: parseFloat(String(ing.dose_value)) || 0,
				doseUnitId: parseInt(String(ing.dose_unit_id), 10) || 0,
			})),
		};

		console.log("🚀 Enviando Payload a API:", { input });

		try {
			const { data } = await addMedicine({ variables: { input } });

			if (data?.addMedicine?.result) {
				toast.success(
					data.addMedicine.message ||
						intl.formatMessage({ id: "medicine.success.message" }),
				);
				if (onClose) onClose();
			} else {
				toast.error(
					data?.addMedicine?.message ||
						intl.formatMessage({ id: "medicine.error.save" }),
				);
			}
		} catch (error: any) {
			console.error("❌ Error GraphQL:", error);
			toast.error(
				error.message ||
					intl.formatMessage({ id: "medicine.error.network" }),
			);
		}
	};

	const isStepValid = (): boolean => {
		switch (activeStep) {
			case 0:
				return (
					!!formData.name &&
					!!formData.id_brand &&
					!!formData.manufacturer_id &&
					!!formData.category_id &&
					!!formData.administration_route_id &&
					formData.ingredients.length > 0 &&
					formData.ingredients.every(
						(ing) =>
							!!ing.active_ingredient_id &&
							!!ing.dose_value &&
							!!ing.dose_unit_id,
					)
				);
			case 1:
				const baseValid =
					!!formData.supplier_id &&
					!!formData.presentation_id &&
					!!formData.unit_of_measure_id &&
					!!formData.units_per_presentation &&
					!!formData.cost_price &&
					!!formData.price_full_presentation;

				if (formData.is_fractionable) {
					return baseValid && !!formData.price_per_unit;
				}
				return baseValid;
			case 2:
				return (
					!!formData.batch_code &&
					!!formData.expiration_date &&
					!!formData.units
				);
			default:
				return false;
		}
	};

	// Tipamos el parámetro step como un número y el retorno como un React.ReactNode
	const getStepContent = (step: number): React.ReactNode => {
		switch (step) {
			case 0:
				return (
					<MedicalSpecsStep
						formData={formData}
						onChange={handleChange}
						setFormData={setFormData}
					/>
				);
			case 1:
				return (
					<GeneralInfoStep
						formData={formData}
						onChange={handleChange}
						setFormData={setFormData}
					/>
				);
			case 2:
				return (
					<CompositionStep
						formData={formData}
						onChange={handleChange}
						setFormData={setFormData}
					/>
				);
			default:
				return (
					<Typography>
						<FormattedMessage id="medicine.error.unknown_step" />
					</Typography>
				);
		}
	};

	return (
		<Box className="p-3">
			{/* sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 3 }}> */}
			<Stepper className="m-4 " activeStep={activeStep} alternativeLabel>
				{stepKeys.map((key) => (
					<Step key={key}>
						<StepLabel
							sx={{
								// 1. Color del texto INACTIVO (ej: "Empaque y Precios")
								"& .MuiStepLabel-label": {
									color: "#94a3b8", // Un gris claro para que resalte en el fondo oscuro
								},
								// 2. Color del texto ACTIVO
								"& .MuiStepLabel-label.Mui-active": {
									color: "#ffffff", // Blanco
								},
								// 3. Color del texto COMPLETADO
								"& .MuiStepLabel-label.Mui-completed": {
									color: "#cbd5e1", // Gris intermedio
								},
								// 4. Color del círculo INACTIVO
								"& .MuiStepIcon-root": {
									color: "#1e293b", // Un gris muy oscuro que coincida con tus inputs
								},
								// 5. Color del círculo ACTIVO y COMPLETADO
								"& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed":
									{
										color: "#3b82f6", // El color azul que ya tienes
									},
								// 6. Color del número dentro del círculo
								"& .MuiStepIcon-text": {
									fill: "#ffffff", // Blanco para que el número sea visible
								},
							}}
						>
							<FormattedMessage id={key} />
						</StepLabel>
					</Step>
				))}
			</Stepper>

			{activeStep === stepKeys.length ? (
				<Fragment>
					<Typography sx={{ mt: 4, mb: 2, textAlign: "center" }}>
						<FormattedMessage id="medicine.success.saved" />
					</Typography>
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							pt: 2,
						}}
					>
						<button
							type="button"
							onClick={handleReset}
							className="px-4 py-2 text-white rounded-xl transition-colors flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
						>
							<FormattedMessage id="medicine.action.add_another" />
						</button>
					</Box>
				</Fragment>
			) : (
				<Fragment>
					{getStepContent(activeStep)}

					<div className="flex flex-row gap-2 items-end justify-end mt-5   ">
						<button
							type="button"
							color="inherit"
							disabled={activeStep === 0 || isSubmitting}
							onClick={handleBack}
							className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<FormattedMessage id="common.back" />
						</button>
						<button
							type="button"
							onClick={handleNext}
							disabled={!isStepValid() || isSubmitting}
							className="px-4 py-2 text-white rounded-xl transition-colors flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
						>
							{isSubmitting
								? intl.formatMessage({ id: "common.sending" })
								: activeStep === stepKeys.length - 1
									? intl.formatMessage({
											id: "common.send_api",
										})
									: intl.formatMessage({ id: "common.next" })}
						</button>
					</div>
				</Fragment>
			)}
		</Box>
	);
}
