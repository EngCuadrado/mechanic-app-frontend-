import React, { useState, useMemo } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useIntl, FormattedMessage } from "react-intl";
import {
	Autocomplete,
	TextField,
	Select,
	MenuItem,
	FormControlLabel,
	Switch,
	IconButton,
	InputLabel,
	FormControl,
} from "@mui/material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { useAuth } from "../context/AuthContext";
import {
	generateSaleVoucherPDF,
	SaleSummary,
} from "../utils/generateSaleVoucher";
import { nicaDate, nowInNica } from "../utils/dateUtils";
import SimpleModal from "../components/ui/utils/SimpleModal";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// --- GRAPHQL DEFINITIONS ---
const GET_CUSTOMERS = gql`
	query GetCustomers {
		customers {
			nodes {
				customerId
				firstName
				lastName
			}
		}
	}
`;

const GET_MEDICINES_WITH_BATCHES = gql`
	query GetMedicinesWithBatches {
		medicines (first: 100) {
			nodes {
				medicine_id
				name
				requires_prescription
				product {
					product_id
					barcode
					price_per_unit
					price_full_presentation
					stock_units
					is_fractionable
					batches {
						batch_id
						batch_code
						expiration_date
						current_quantity_units
						is_active
					}
					presentation{
						name
					}
					unit_of_measure {
						name
					}
				}	
			}
		}
	}
`;

const GET_PAYMENT_METHODS = gql`
	query GetPaymentMethods {
		paymentMethods {
			nodes {
				paymentMethodId
				name
				isActive
			}
		}
	}
`;

const CREATE_SALE_MUTATION = gql`
	mutation RegistrarVenta($input: CreateSaleInput!) {
		createSale(input: $input) {
			success
			message
			saleId
			receiptNumber
		}
	}
`;

// --- TYPES ---
interface Customer {
	customerId: number;
	firstName: string;
	lastName: string;
}

interface Batch {
	batch_id: number;
	batch_code: string;
	expiration_date: string;
	current_quantity_units: number;
	is_active: boolean;
}
interface ProductInfo {
	product_id: number;
	barcode: string;
	price_per_unit: number;
	price_full_presentation: number;
	stock_units: number;
	is_fractionable: boolean;
	batches: Batch[];
	presentation?: {
		name: string;
	};
	unit_of_measure?: {
		name: string;
	};
}

interface Medicine {
	medicine_id: number;
	name: string;
	requires_prescription: boolean;
	product: ProductInfo;
}

interface PaymentMethod {
	paymentMethodId: number;
	name: string;
	isActive: boolean;
}

interface CartItem {
	id: string; // Unique ID for the cart row
	medicine: Medicine;
	batch: Batch | null;
	quantity: number;
	isFullPresentation: boolean;
	promotionId: number | null;
}

interface PaymentItem {
	id: string;
	paymentMethodId: number | "";
	amount: number | "";
	transactionReference: string;
}

export default function Sale() {
	const { user } = useAuth();
	const intl = useIntl();

	// --- STATE: Header Section ---
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
		null,
	);
	const [saleType, setSaleType] = useState<string>("LIBRE"); // LIBRE or RECETA
	const [showMedicalData, setShowMedicalData] = useState<boolean>(false);
	const [prescriptionNumber, setPrescriptionNumber] = useState<string>("");
	const [doctorName, setDoctorName] = useState<string>("");
	const [receiptNumber, setReceiptNumber] = useState<string>(
		crypto.randomUUID(),
	);

	// --- STATE: Cart & Search ---
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [cart, setCart] = useState<CartItem[]>([]);
	const [selectedMedicineForBatch, setSelectedMedicineForBatch] =
		useState<Medicine | null>(null);

	// --- STATE: Payments ---
	const [payments, setPayments] = useState<PaymentItem[]>([
		{
			id: Date.now().toString(),
			paymentMethodId: "",
			amount: "",
			transactionReference: "",
		},
	]);

	// --- STATE: Voucher ---
	const [completedSaleData, setCompletedSaleData] =
		useState<SaleSummary | null>(null);

	// --- QUERIES & MUTATIONS ---
	const { data: customersData, refetch: refetchCustomers } =
		useQuery(GET_CUSTOMERS);
	const { data: medicinesData, refetch: refetchMedicines } = useQuery(
		GET_MEDICINES_WITH_BATCHES,
	);
	const { data: paymentMethodsData, refetch: refetchPaymentMethods } =
		useQuery(GET_PAYMENT_METHODS);
	const [createSale, { loading: isSubmitting }] =
		useMutation(CREATE_SALE_MUTATION);

	// --- DERIVED STATE / CALCULATIONS ---
	const subtotal = useMemo(() => {
		return cart.reduce((acc, item) => {
			if (!item.batch || !item.medicine.product) return acc;
			const price = item.isFullPresentation
				? item.medicine.product.price_full_presentation
				: item.medicine.product.price_per_unit;
			return acc + price * item.quantity;
		}, 0);
	}, [cart]);

	const iva = subtotal * 0.15; // Example 15% IVA
	const grandTotal = subtotal + iva;

	const totalPaid = useMemo(() => {
		return payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
	}, [payments]);

	const changeDue = totalPaid - grandTotal;

	// --- HANDLERS: Search & Cart ---
	const handleProductSelect = (medicine: Medicine) => {
		if (
			!medicine.product ||
			!medicine.product.batches ||
			medicine.product.batches.length === 0
		) {
			toast.error(intl.formatMessage({ id: "sale.error.no_batches" }));
			return;
		}

		// Filter active batches with stock
		const availableBatches = medicine.product.batches.filter(
			(b) => b.is_active && b.current_quantity_units > 0,
		);

		if (availableBatches.length === 0) {
			toast.error(
				intl.formatMessage({ id: "sale.error.no_active_batches" }),
			);
			return;
		}

		// Auto-detect if prescription is needed
		if (medicine.requires_prescription) {
			setSaleType("RECETA");
			setShowMedicalData(true);
			toast.info(
				intl.formatMessage(
					{ id: "sale.info.requires_prescription" },
					{ name: medicine.name },
				),
			);
		}

		if (availableBatches.length === 1) {
			// Auto select if only one batch
			addBatchToCart(medicine, availableBatches[0]);
		} else {
			// Open modal to select batch
			setSelectedMedicineForBatch(medicine);
		}
		setSearchQuery(""); // Clear search
	};

	const addBatchToCart = (medicine: Medicine, batch: Batch) => {
		setCart((prev) => [
			...prev,
			{
				id: Date.now().toString() + Math.random(),
				medicine,
				batch,
				quantity: 1,
				isFullPresentation: false, // Default to full
				promotionId: null,
			},
		]);
		setSelectedMedicineForBatch(null);
	};

	const updateCartItem = (
		id: string,
		field: keyof CartItem,
		value: number | boolean,
	) => {
		setCart((prev) =>
			prev.map((item) => {
				if (item.id === id) {
					// Validation on quantity change
					if (field === "quantity" && item.batch) {
						const valNum = Number(value);
						if (valNum > item.batch.current_quantity_units) {
							toast.error(
								intl.formatMessage(
									{ id: "sale.error.quantity_exceeds_stock" },
									{
										stock: item.batch
											.current_quantity_units,
									},
								),
							);
							return {
								...item,
								[field]: item.batch.current_quantity_units,
							};
						}
						if (valNum < 1) return { ...item, [field]: 1 };
					}
					return { ...item, [field]: value };
				}
				return item;
			}),
		);
	};

	const removeCartItem = (id: string) => {
		setCart((prev) => prev.filter((item) => item.id !== id));
	};

	// --- HANDLERS: Payments ---
	const addPaymentRow = () => {
		setPayments((prev) => [
			...prev,
			{
				id: Date.now().toString(),
				paymentMethodId: "",
				amount: "",
				transactionReference: "",
			},
		]);
	};

	const updatePaymentRow = (
		id: string,
		field: keyof PaymentItem,
		value: string | number,
	) => {
		setPayments((prev) =>
			prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
		);
	};

	const removePaymentRow = (id: string) => {
		if (payments.length > 1) {
			setPayments((prev) => prev.filter((p) => p.id !== id));
		}
	};

	// --- HANDLERS: Submission ---
	const handleProcessSale = async () => {
		// Validations
		if (cart.length === 0) {
			toast.error(intl.formatMessage({ id: "sale.error.cart_empty" }));
			return;
		}
		if (cart.some((item) => !item.batch)) {
			toast.error(
				intl.formatMessage({ id: "sale.error.no_batch_assigned" }),
			);
			return;
		}
		if (totalPaid < grandTotal) {
			toast.error(
				intl.formatMessage({ id: "sale.error.insufficient_payment" }),
			);
			return;
		}
		if (!receiptNumber) {
			toast.error(
				intl.formatMessage({ id: "sale.error.missing_receipt_number" }),
			);
			return;
		}

		// Medical validation
		if (
			saleType === "RECETA" &&
			(!prescriptionNumber.trim() || !doctorName.trim())
		) {
			toast.error(
				intl.formatMessage({ id: "sale.error.medical_data_required" }),
			);
			return;
		}

		// Prepare payments
		let remainingAmountToCover = grandTotal;
		const finalPayments = payments
			.filter((p) => p.paymentMethodId !== "" && Number(p.amount) > 0)
			.map((p) => {
				let amountToRegister = Number(p.amount);
				if (amountToRegister > remainingAmountToCover) {
					amountToRegister = remainingAmountToCover;
				}
				remainingAmountToCover -= amountToRegister;

				return {
					paymentMethodId: Number(p.paymentMethodId),
					amount: parseFloat(amountToRegister.toFixed(2)),
					transactionReference: p.transactionReference || null,
				};
			});

		const payload = {
			employeeId: user?.employeeId || 1,
			customerId: selectedCustomer?.customerId || null,
			receiptType: "TICKET",
			receiptNumber,
			prescriptionNumber:
				(saleType === "RECETA" || showMedicalData) && prescriptionNumber
					? prescriptionNumber
					: null,
			doctorName:
				(saleType === "RECETA" || showMedicalData) && doctorName
					? doctorName
					: null,
			currency: "NIO",
			details: cart.map((item) => ({
				productId: item.medicine.product.product_id,
				batchId: item.batch!.batch_id,
				quantity: Number(item.quantity),
				promotionId: item.promotionId,
				isFullPresentation: item.isFullPresentation,
			})),
			payments: finalPayments,
		};

		try {
			const { data } = await createSale({
				variables: { input: payload },
			});

			if (data?.createSale?.success) {
				toast.success(
					data.createSale.message ||
					intl.formatMessage({ id: "sale.success.message" }),
				);

				const saleSummary: SaleSummary = {
					receiptNumber:
						data.createSale.receiptNumber || receiptNumber,
					receiptType: "TICKET",
					date: nowInNica().toDate(),
					customer: selectedCustomer
						? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
						: intl.formatMessage({ id: "sale.final_consumer" }),
					items: cart.map((item) => {
						const price = item.isFullPresentation
							? item.medicine.product.price_full_presentation
							: item.medicine.product.price_per_unit;
						return {
							name: item.medicine.name,
							quantity: item.quantity,
							price: price,
							total: item.quantity * price,
							presentation: item.isFullPresentation
								? item.medicine.product.presentation?.name || intl.formatMessage({
									id: "sale.presentation.box",
								})
								: item.medicine.product.unit_of_measure?.name || intl.formatMessage({
									id: "sale.presentation.unit",
								}),
						};
					}),
					subtotal,
					iva,
					grandTotal,
					totalPaid,
					changeDue,
				};

				setCompletedSaleData(saleSummary);
				generateSaleVoucherPDF(saleSummary);

				// Reset
				setCart([]);
				setPayments([
					{
						id: Date.now().toString(),
						paymentMethodId: "",
						amount: "",
						transactionReference: "",
					},
				]);
				setReceiptNumber(crypto.randomUUID());
				setSelectedCustomer(null);
				setPrescriptionNumber("");
				setDoctorName("");
				setSearchQuery("");
				setSaleType("LIBRE");
				setShowMedicalData(false);

				refetchCustomers();
				refetchMedicines();
				refetchPaymentMethods();
			} else {
				toast.error(
					data?.createSale?.message ||
					intl.formatMessage({ id: "sale.error.save" }),
				);
			}
		} catch (err) {
			console.error(err);
			toast.error(intl.formatMessage({ id: "sale.error.process" }));
		}
	};

	const startTour = () => {
		const driverObj = driver({
			showProgress: true,
			nextBtnText: "Siguiente",
			prevBtnText: "Anterior",
			doneBtnText: "Finalizar",
			steps: [
				{
					element: "#tour-tipo-venta",
					popover: {
						title: "Tipo de Venta",
						description: "Cambia el tipo de venta. Si es con receta, te pediremos los datos médicos.",
						side: "bottom",
						align: "start",
					},
				},
				{
					element: "#tour-busqueda-producto",
					popover: {
						title: "Búsqueda de Productos",
						description: "Busca productos por nombre o código de barras. Selecciona uno para ver sus lotes disponibles.",
						side: "bottom",
						align: "start",
					},
				},
				{
					element: "#tour-pagos",
					popover: {
						title: "Métodos de Pago",
						description: "Puedes agregar múltiples métodos de pago (ej. Efectivo y Tarjeta) para cubrir el total.",
						side: "left",
						align: "start",
					},
				},
				{
					element: "#tour-procesar",
					popover: {
						title: "Procesar Venta",
						description: "Una vez que el total esté cubierto, haz clic aquí para facturar e imprimir el ticket.",
						side: "top",
						align: "start",
					},
				},
			],
		});

		driverObj.drive();
	};

	const productSearchOptions = useMemo(() => {
		if (!medicinesData?.medicines?.nodes) return [];
		const nodes = medicinesData.medicines.nodes as Medicine[];
		if (searchQuery.length < 2) return nodes;
		const lowerQuery = searchQuery.toLowerCase();
		return nodes.filter(
			(med) =>
				med.name.toLowerCase().includes(lowerQuery) ||
				(med.product?.barcode &&
					med.product.barcode.toLowerCase().includes(lowerQuery)),
		);
	}, [medicinesData, searchQuery]);

	return (
		<div className="pb-20">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div className="flex-1 [&>div]:mb-0">
					<PageBreadcrumb
						pageTitle={intl.formatMessage({ id: "sale.page_title" })}
					/>
				</div>
				<button
					onClick={startTour}
					className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
				>
					<svg
						className="h-5 w-5 text-gray-500 dark:text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					Guía rápida
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<h2 className="text-lg font-semibold text-gray-800 dark:text-white">
								<FormattedMessage id="sale.data" />
							</h2>

							<div className="flex items-center gap-4">
								<div className="hidden">
									<Autocomplete
										options={
											customersData?.customers?.nodes ||
											[]
										}
										getOptionLabel={(opt: Customer) =>
											`${opt.firstName} ${opt.lastName}`
										}
										value={selectedCustomer}
										onChange={(_, val) =>
											setSelectedCustomer(val)
										}
										renderInput={(params) => (
											<TextField
												sx={{
													".dark & .MuiInputBase-input": {
														color: "#9ca3af", // Equivalente a text-gray-400
													},
													".dark & .MuiInputLabel-root": {
														color: "#9ca3af",
													},

													".dark & .MuiOutlinedInput-notchedOutline": {
														borderColor: "#4b5563 !important",
													}
												}}
												{...params}
												label={intl.formatMessage({
													id: "sale.customer",
												})}
												variant="outlined"
												size="small"
											/>
										)}
									/>
								</div>

								<FormControl
									id="tour-tipo-venta"
									size="small"
									sx={{ minWidth: 200 }}
								>
									<InputLabel>
										<div className="dark:text-gray-400">
											<FormattedMessage id="sale.type" />
										</div>
									</InputLabel>
									<Select
										sx={{
											// Si hay un ancestro con clase .dark, aplica este color al texto
											".dark & .MuiSelect-select": {
												color: "#9ca3af !important",
											},
											// Y este color al icono de la flecha
											".dark & .MuiSvgIcon-root": {
												color: "#9ca3af !important",
											},
											// Opcional: si quieres cambiar el color del borde en modo oscuro
											".dark & .MuiOutlinedInput-notchedOutline": {
												borderColor: "#4b5563 !important",
											}
										}}
										value={saleType}
										label={intl.formatMessage({
											id: "sale.type",
										})}
										onChange={(e) => {
											const val = e.target.value;
											setSaleType(val);
											if (val === "RECETA")
												setShowMedicalData(true);
											else setShowMedicalData(false);
										}}
									>
										<MenuItem value="LIBRE">
											<FormattedMessage id="sale.type_free" />
										</MenuItem>
										<MenuItem value="RECETA">
											<FormattedMessage id="sale.type_prescription" />
										</MenuItem>
									</Select>
								</FormControl>
							</div>
						</div>

						<div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 dark:text-gray-400">
							<FormControlLabel
								control={
									<Switch
										checked={showMedicalData}
										onChange={(e) =>
											setShowMedicalData(e.target.checked)
										}
										disabled={saleType === "RECETA"}
									/>
								}
								label={intl.formatMessage({
									id: "sale.include_medical_data",
								})}
							/>
							{showMedicalData && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
									<TextField
										sx={{
											".dark & .MuiInputBase-input": {
												color: "#9ca3af", // Equivalente a text-gray-400
											},
											".dark & .MuiInputLabel-root": {
												color: "#9ca3af",
											},
											".dark & .MuiOutlinedInput-notchedOutline": {
												borderColor: "#4b5563 !important",
											}
										}}
										label={intl.formatMessage({
											id: "sale.prescription_number",
										})}
										variant="outlined"
										size="small"
										required={saleType === "RECETA"}
										value={prescriptionNumber}
										onChange={(e) =>
											setPrescriptionNumber(
												e.target.value,
											)
										}
										error={
											saleType === "RECETA" &&
											!prescriptionNumber.trim()
										}
									/>
									<TextField
										sx={{
											".dark & .MuiInputBase-input": {
												color: "#9ca3af", // Equivalente a text-gray-400
											},
											".dark & .MuiInputLabel-root": {
												color: "#9ca3af",
											},
											".dark & .MuiOutlinedInput-notchedOutline": {
												borderColor: "#4b5563 !important",
											}
										}}
										label={intl.formatMessage({
											id: "sale.doctor_name",
										})}
										variant="outlined"
										size="small"
										required={saleType === "RECETA"}
										value={doctorName}
										onChange={(e) =>
											setDoctorName(e.target.value)
										}
										error={
											saleType === "RECETA" &&
											!doctorName.trim()
										}
									/>
								</div>
							)}
						</div>
					</div>

					<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
						<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
							<FormattedMessage
								id="products"
								values={{ count: 2 }}
							/>
						</h2>

						<div id="tour-busqueda-producto" className="mb-6">
							<Autocomplete
								options={productSearchOptions}
								getOptionLabel={(opt: Medicine | string) => {
									if (typeof opt === "string") return opt;
									return `${opt.product?.barcode || "N/A"} - ${opt.name}`;
								}}
								inputValue={searchQuery}
								onInputChange={(_, newInputValue) =>
									setSearchQuery(newInputValue)
								}
								onChange={(_, val) => {
									if (val && typeof val !== "string")
										handleProductSelect(val);
								}}
								renderInput={(params) => (
									<TextField
										sx={{
											".dark & .MuiInputBase-input": {
												color: "#9ca3af", // Equivalente a text-gray-400
											},
											".dark & .MuiInputLabel-root": {
												color: "#9ca3af",
											},

											".dark & .MuiOutlinedInput-notchedOutline": {
												borderColor: "#4b5563 !important",
											},
											".dark & .MuiAutocomplete-clearIndicator": {
												color: "#9ca3af !important",
											},
											".dark & .MuiAutocomplete-popupIndicator": {
												color: "#9ca3af !important",
											}
										}}
										{...params}
										label={intl.formatMessage({
											id: "sale.search_placeholder",
										})}
										variant="outlined"
										autoFocus
									/>
								)}
								freeSolo
								clearOnBlur
							/>
						</div>

						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
								<thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
									<tr>
										<th className="px-4 py-3">
											<FormattedMessage id="sale.table.product" />
										</th>
										<th className="px-4 py-3">
											<FormattedMessage id="sale.table.batch_exp" />
										</th>
										<th className="px-4 py-3">
											<FormattedMessage id="sale.table.presentation" />
										</th>
										<th className="px-4 py-3">
											<FormattedMessage id="sale.table.quantity" />
										</th>
										<th className="px-4 py-3 text-right">
											<FormattedMessage id="sale.table.unit_price" />
										</th>
										<th className="px-4 py-3 text-right">
											<FormattedMessage id="sale.table.total" />
										</th>
										<th className="px-4 py-3 text-center">
											<FormattedMessage id="actions" />
										</th>
									</tr>
								</thead>
								<tbody>
									{cart.length === 0 ? (
										<tr>
											<td
												colSpan={7}
												className="px-4 py-8 text-center"
											>
												<FormattedMessage id="sale.cart_empty" />
											</td>
										</tr>
									) : (
										cart.map((item) => {
											const price =
												item.isFullPresentation
													? item.medicine.product
														.price_full_presentation
													: item.medicine.product
														.price_per_unit;
											const lineTotal =
												price * item.quantity;

											return (
												<tr
													key={item.id}
													className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
												>
													<td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
														{item.medicine.name}
														{item.medicine
															.requires_prescription && (
																<span className="ml-2 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
																	Rx
																</span>
															)}
													</td>
													<td className="px-4 py-3">
														{item.batch ? (
															<span className="text-xs">
																{
																	item.batch
																		.batch_code
																}
																<br />
																<span className="text-gray-400">
																	{
																		item
																			.batch
																			.expiration_date
																	}
																</span>
															</span>
														) : (
															intl.formatMessage({
																id: "sale.no_batch",
															})
														)}
													</td>
													<td className="px-4 py-3">
														<FormControlLabel
															control={
																<Switch
																	size="small"
																	checked={
																		item.isFullPresentation
																	}
																	onChange={(
																		e,
																	) =>
																		updateCartItem(
																			item.id,
																			"isFullPresentation",
																			e
																				.target
																				.checked,
																		)
																	}
																	disabled={
																		!item
																			.medicine
																			.product
																			?.is_fractionable
																	}
																/>
															}
															label={
																<span className="text-xs">
																	{item.isFullPresentation
																		? item.medicine.product.presentation?.name || intl.formatMessage(
																			{
																				id: "sale.presentation.box",
																			},
																		)
																		: item.medicine.product.unit_of_measure?.name || intl.formatMessage(
																			{
																				id: "sale.presentation.unit",
																			},
																		)}
																</span>
															}
														/>
													</td>
													<td className="px-4 py-3 w-24">
														<TextField
															sx={{
																".dark & .MuiInputBase-input": {
																	color: "#9ca3af", // Equivalente a text-gray-400
																},
																".dark & .MuiInputLabel-root": {
																	color: "#9ca3af",
																},

																".dark & .MuiOutlinedInput-notchedOutline": {
																	borderColor: "#4b5563 !important",
																}
															}}
															type="number"
															size="small"
															slotProps={{
																input: {
																	min: 1,
																	max:
																		item.batch
																			?.current_quantity_units ||
																		1,
																},
															}}
															value={
																item.quantity
															}
															onChange={(e) =>
																updateCartItem(
																	item.id,
																	"quantity",
																	Number(
																		e.target
																			.value,
																	),
																)
															}
														/>
													</td>
													<td className="px-4 py-3 text-right font-mono">
														C$ {price.toFixed(2)}
													</td>
													<td className="px-4 py-3 text-right font-mono font-semibold text-blue-600 dark:text-blue-400">
														C${" "}
														{lineTotal.toFixed(2)}
													</td>
													<td className="px-4 py-3 text-center">
														<IconButton
															color="error"
															onClick={() =>
																removeCartItem(
																	item.id,
																)
															}
														>
															<TrashIcon className="h-5 w-5" />
														</IconButton>
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<div className="space-y-6">
					<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
						<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
							<FormattedMessage id="sale.summary_title" />
						</h2>
						<div className="space-y-3 mb-6 border-b border-gray-200 pb-6 dark:border-gray-700">
							<div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
								<span>
									<FormattedMessage id="sale.subtotal_bruto" />
								</span>
								<span className="font-mono">
									C$ {subtotal.toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
								<span>
									<FormattedMessage id="sale.iva" />
								</span>
								<span className="font-mono">
									C$ {iva.toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
								<span>
									<FormattedMessage id="sale.grand_total" />
								</span>
								<span className="font-mono text-emerald-600 dark:text-emerald-400">
									C$ {grandTotal.toFixed(2)}
								</span>
							</div>
						</div>

						<div id="tour-pagos">
							<h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">
								<FormattedMessage id="sale.payment_methods" />
							</h3>
							<div className="space-y-4">
								{payments.map((payment) => (
									<div
										key={payment.id}
										className="relative p-4 border border-gray-100 rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700"
									>
										{payments.length > 1 && (
											<button
												onClick={() =>
													removePaymentRow(payment.id)
												}
												className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors"
											>
												<TrashIcon className="h-4 w-4" />
											</button>
										)}
										<div className="grid grid-cols-2 gap-3 mb-3">
											<FormControl size="small" fullWidth>
												<InputLabel>
													<div className="dark:text-gray-400">
														<FormattedMessage id="sale.payment_method" />
													</div>
												</InputLabel>
												<Select
													sx={{
														// Si hay un ancestro con clase .dark, aplica este color al texto
														".dark & .MuiSelect-select": {
															color: "#9ca3af !important",
														},
														// Y este color al icono de la flecha
														".dark & .MuiSvgIcon-root": {
															color: "#9ca3af !important",
														},
														// Opcional: si quieres cambiar el color del borde en modo oscuro
														".dark & .MuiOutlinedInput-notchedOutline": {
															borderColor: "#4b5563 !important",
														}
													}}
													value={payment.paymentMethodId}
													label={intl.formatMessage({
														id: "sale.payment_method",
													})}
													onChange={(e) =>
														updatePaymentRow(
															payment.id,
															"paymentMethodId",
															e.target.value as number,
														)
													}
												>
													{paymentMethodsData?.paymentMethods?.nodes
														?.filter(
															(pm: PaymentMethod) =>
																pm.isActive,
														)
														.map(
															(pm: PaymentMethod) => (
																<MenuItem
																	key={
																		pm.paymentMethodId
																	}
																	value={
																		pm.paymentMethodId
																	}
																>
																	{pm.name}
																</MenuItem>
															),
														)}
												</Select>
											</FormControl>
											<TextField
												sx={{
													".dark & .MuiInputBase-input": {
														color: "#9ca3af", // Equivalente a text-gray-400
													},
													".dark & .MuiInputLabel-root": {
														color: "#9ca3af",
													},

													".dark & .MuiOutlinedInput-notchedOutline": {
														borderColor: "#4b5563 !important",
													}
												}}
												label={intl.formatMessage({
													id: "sale.amount",
												})}
												type="number"
												size="small"
												fullWidth
												value={payment.amount}
												onChange={(e) =>
													updatePaymentRow(
														payment.id,
														"amount",
														e.target.value,
													)
												}
											/>
										</div>
										{payment.paymentMethodId !== 1 &&
											payment.paymentMethodId !== "" && (
												<TextField
													sx={{
														".dark & .MuiInputBase-input": {
															color: "#9ca3af", // Equivalente a text-gray-400
														},
														".dark & .MuiInputLabel-root": {
															color: "#9ca3af",
														},

														".dark & .MuiOutlinedInput-notchedOutline": {
															borderColor: "#4b5563 !important",
														}
													}}
													label={intl.formatMessage({
														id: "sale.reference_voucher",
													})}
													size="small"
													fullWidth
													value={
														payment.transactionReference
													}
													onChange={(e) =>
														updatePaymentRow(
															payment.id,
															"transactionReference",
															e.target.value,
														)
													}
												/>
											)}
									</div>
								))}
								<button
									onClick={addPaymentRow}
									className="w-full items-center justify-center px-4 py-2 rounded-xl transition-colors flex items-center gap-2 border border-solid border-gray-300 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] text-gray-700"
								>
									<FormattedMessage id="sale.add_payment" />
								</button>
							</div>
						</div>

						<div
							className={`mt-6 p-4 rounded-lg ${changeDue >= 0 ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300" : "bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300"}`}
						>
							<div className="flex justify-between font-medium">
								<span>
									{changeDue >= 0 ? (
										<FormattedMessage id="sale.change_due" />
									) : (
										<FormattedMessage id="sale.amount_missing" />
									)}
								</span>
								<span className="font-mono">
									C$ {Math.abs(changeDue).toFixed(2)}
								</span>
							</div>
						</div>

						<button
							id="tour-procesar"
							className="w-full mt-6 px-4 py-3 text-white rounded-xl transition-colors flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-lg font-bold dark:disabled:bg-sky-950 dark:disabled:text-gray-400"
							onClick={handleProcessSale}
							disabled={
								isSubmitting ||
								cart.length === 0 ||
								totalPaid < grandTotal
							}
						>
							{isSubmitting
								? intl.formatMessage({ id: "sale.processing" })
								: intl.formatMessage({
									id: "sale.process_sale",
								})}
						</button>
					</div>
				</div>
			</div>

			{/* Modal para seleccionar lote */}
			<SimpleModal
				isOpen={!!selectedMedicineForBatch}
				onClose={() => setSelectedMedicineForBatch(null)}
				title={intl.formatMessage(
					{ id: "sale.select_batch_title" },
					{ name: selectedMedicineForBatch?.name },
				)}
				footer={
					<button
						onClick={() => setSelectedMedicineForBatch(null)}
						className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center gap-2"
					>
						<FormattedMessage id="cancel" />
					</button>
				}
			>
				<div className="space-y-3">
					{selectedMedicineForBatch?.product?.batches
						?.filter(
							(b) => b.is_active && b.current_quantity_units > 0,
						)
						.map((batch) => (
							<div
								key={batch.batch_id}
								className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer"
								onClick={() =>
									addBatchToCart(
										selectedMedicineForBatch,
										batch,
									)
								}
							>
								<div>
									<div className="font-medium text-gray-900 dark:text-white">
										<FormattedMessage
											id="sale.batch_label"
											values={{
												batch_code: batch.batch_code,
											}}
										/>
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										<FormattedMessage
											id="sale.exp_label"
											values={{
												expiration_date:
													batch.expiration_date,
											}}
										/>
									</div>
								</div>
								<div className="text-right">
									<div className="font-medium text-emerald-600 dark:text-emerald-400">
										<FormattedMessage
											id="sale.stock_label"
											values={{
												current_quantity_units:
													batch.current_quantity_units,
											}}
										/>
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										<FormattedMessage
											id="sale.price_label"
											values={{
												price: selectedMedicineForBatch
													.product
													.price_full_presentation,
											}}
										/>
									</div>
								</div>
							</div>
						))}
				</div>
			</SimpleModal>

			{/* Modal de Comprobante / Voucher */}
			<SimpleModal
				isOpen={!!completedSaleData}
				onClose={() => setCompletedSaleData(null)}
				title={intl.formatMessage({ id: "sale.pharmacy_name" })}
				footer={
					<div className="flex gap-3">
						<button
							onClick={() => setCompletedSaleData(null)}
							className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors flex items-center gap-2"
						>
							<FormattedMessage id="sale.close" />
						</button>
						<button
							onClick={() =>
								completedSaleData &&
								generateSaleVoucherPDF(completedSaleData, true)
							}
							className="px-4 py-2 text-white rounded-xl transition-colors flex items-center gap-2 bg-brand-500 hover:bg-brand-600"
						>
							<FormattedMessage id="sale.print_pdf" />
						</button>
					</div>
				}
			>
				{completedSaleData && (
					<div className="space-y-4 text-sm text-gray-800 dark:text-gray-200">
						<div className="text-center mb-6">
							<p className="font-semibold text-lg uppercase">
								{completedSaleData.receiptType}
							</p>
							<p>
								<FormattedMessage
									id="sale.receipt_number"
									values={{
										receiptNumber:
											completedSaleData.receiptNumber,
									}}
								/>
							</p>
							<p>
								<FormattedMessage
									id="sale.date_label"
									values={{
										date: nicaDate(
											completedSaleData.date,
										).format("DD/MM/YYYY hh:mm A"),
									}}
								/>
							</p>
						</div>
						<div className="mb-4">
							<strong>
								<FormattedMessage id="sale.customer" />:
							</strong>{" "}
							{completedSaleData.customer}
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm border-collapse">
								<thead>
									<tr className="border-b border-gray-300 dark:border-gray-700">
										<th className="py-2">
											<FormattedMessage id="sale.table.quantity_short" />
										</th>
										<th className="py-2">
											<FormattedMessage id="description" />
										</th>
										<th className="py-2 text-right">
											<FormattedMessage id="sale.table.total" />
										</th>
									</tr>
								</thead>
								<tbody>
									{completedSaleData.items.map(
										(item, idx) => (
											<tr
												key={idx}
												className="border-b border-gray-100 dark:border-gray-800"
											>
												<td className="py-2">
													{item.quantity}
												</td>
												<td className="py-2">
													{item.name}{" "}
													<span className="text-xs text-gray-500">
														({item.presentation})
													</span>
												</td>
												<td className="py-2 text-right font-mono">
													C$ {item.total.toFixed(2)}
												</td>
											</tr>
										),
									)}
								</tbody>
							</table>
						</div>
						<div className="space-y-1 text-right mt-6 border-t border-gray-300 dark:border-gray-700 pt-4">
							<p>
								<FormattedMessage id="sale.subtotal" />{" "}
								<span className="font-mono">
									C$ {completedSaleData.subtotal.toFixed(2)}
								</span>
							</p>
							<p>
								<FormattedMessage id="sale.iva_label" />{" "}
								<span className="font-mono">
									C$ {completedSaleData.iva.toFixed(2)}
								</span>
							</p>
							<p className="font-bold text-lg mt-2">
								<FormattedMessage id="sale.total_label" />{" "}
								<span className="font-mono">
									C${" "}
									{completedSaleData.grandTotal.toFixed(2)}
								</span>
							</p>
							<div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
								<p className="text-gray-600 dark:text-gray-400">
									<FormattedMessage id="sale.paid_label" />{" "}
									<span className="font-mono">
										C${" "}
										{completedSaleData.totalPaid.toFixed(2)}
									</span>
								</p>
								<p className="text-gray-600 dark:text-gray-400">
									<FormattedMessage id="sale.change_label" />{" "}
									<span className="font-mono">
										C${" "}
										{Math.abs(
											completedSaleData.changeDue,
										).toFixed(2)}
									</span>
								</p>
							</div>
						</div>
						<div className="text-center mt-6 italic text-gray-500">
							<FormattedMessage id="sale.thanks_message" />
						</div>
					</div>
				)}
			</SimpleModal>
		</div>
	);
}
