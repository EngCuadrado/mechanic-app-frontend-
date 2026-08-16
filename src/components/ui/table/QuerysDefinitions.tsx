import { gql } from "@apollo/client";

export const GET_ALL_SALES = () => gql`
	query GetSalesWithDetails(
		$first: Int
		$after: String
		$where: SaleFilterInput
	) {
		sales(first: $first, after: $after, order: [{ saleDate: DESC }], where: $where) {
			# Información de la paginación
			pageInfo {
				hasNextPage
				endCursor
			}
			# Nodos (la lista de ventas)
			nodes {
				saleId
				saleDate
				netTotal
				currency
				doctorName
				prescriptionNumber

				# Empleado
				employee {
					names
					lastnames
				}

				# Detalles y productos anidados
				saleDetails {
					quantity
					product {
						medicine {
							name
						}
					}
				}

				# Pagos
				salePayments {
					amount
					paymentMethod {
						paymentMethodId
						name
					}
				}
			}
		}
	}
`;

export const GET_EMPLOYEES_QUERY = () => gql`
	query GetEmployees(
		$first: Int
		$after: String
		$order: [EmployeeSortInput!]
	) {
		employees(first: $first, after: $after, order: $order) {
			nodes {
				employeeId
				names
				lastnames
				user
				email
				phone
				hiring_date
				url_photo
				employeeRoleId
				roleName: employeeRole {
					name
				}
				statusName: employeeStatus {
					name
				}
				employeeStatusId
			}
			pageInfo {
				hasNextPage
				endCursor
			}
		}
	}
`;

export const GET_BRANDS_QUERY = () => gql`
	query GetBrands($first: Int, $after: String, $order: [BrandsSortInput!]) {
		brands(first: $first, after: $after, order: $order) {
			nodes {
				id_brand
				name
				logo_url
				contact_phone
				contact_email
				created_at
				updated_at
				is_active
			}
			pageInfo {
				hasNextPage
				endCursor
			}
		}
	}
`;

export const GET_CATEGORIES_QUERY = () => gql`
	query GetCategories(
		$first: Int
		$after: String
		$order: [CategorySortInput!]
	) {
		categories(first: $first, after: $after, order: $order) {
			nodes {
				category_id
				name
				description
				is_active
			}
			pageInfo {
				hasNextPage
				endCursor
			}
		}
	}
`;

// NOTA:
// Aunque no se utilice el Id (active_ingredient_id) para mostrarlo en las columnas
// Se debe de añadir por problemas de cache en graphql
export const GET_ACTIVE_INGREDIENTES_QUERY = () => gql`
	query GetActiveIngredients(
		$first: Int
		$after: String
		$order: [ActiveIngredientSortInput!]
	) {
		activeIngredients(first: $first, after: $after, order: $order) {
			nodes {
				active_ingredient_id
				name
				description
				is_controlled
				is_active
			}
			pageInfo {
				hasNextPage
				endCursor
			}
		}
	}
`;

export const GET_ADMINISTRATION_ROUTES_QUERY = () => gql`
	query GetAdministrationRoutes(
		$first: Int
		$after: String
		$order: [AdministrationRouteSortInput!]
	) {
		administrationRoutes(first: $first, after: $after, order: $order) {
			nodes {
				administration_route_id
				name
				description
				is_active
			}
			pageInfo {
				hasNextPage
				endCursor
			}
		}
	}
`;

export const GET_SUPPLIER_TYPES_QUERY = () => gql`
	query GetSupplierTypes(
		$first: Int
		$after: String
		$order: [SupplierTypeSortInput!]
	) {
		supplierTypes(first: $first, after: $after, order: $order) {
			nodes {
				supplier_type_id
				type_name
				description
			}
			pageInfo {
				hasNextPage
				endCursor
			}
		}
	}
`;

export const GET_SUPPLIER_QUERY = () => gql`
	query GetSuppliers(
		$first: Int
		$after: String
		$order: [SupplierSortInput!]
	) {
		suppliers(first: $first, after: $after, order: $order) {
			nodes {
				supplier_id
				company_name
				tax_id
				contact_name
				phone
				address
				email
				website
				is_active
				type {
					supplier_type_id
					type_name
				}
			}
			pageInfo {
				hasNextPage
			}
		}
	}
`;

export const GET_EMPLOYEE_ROLE = () => gql`
	query {
		employeeRoles {
			employeeRoleId
			name
			status
		}
	}
`;

export const GET_MEDICINE_QUERY = () => gql`
	query GetMedicineTherapeuticDetails(
		$first: Int
		$after: String
		$order: [MedicineSortInput!]
		$where: MedicineFilterInput
	) {
		medicines(first: $first, after: $after, order: $order, where: $where) {
			nodes {
				medicine_id
				name
				description
				requires_prescription

				# Relación con Ingredientes Activos (Todos los que tenga el ID)
				medicine_active_ingredients {
					active_ingredient_id
					dose_unit_id
					dose_value
					dose_unit {
						name
						abbreviation
					}
					active_ingredient {
						name
					}
				}

				# Datos de clasificación
				brand {
					id_brand
					name
				}

				manufacturer {
					manufacturer_id
					name
				}

				category {
					category_id
					name
				}

				administration_route {
					administration_route_id
					name
				}

				product {
					barcode
					product_id
					stock_units
					min_stock_units
					price_per_unit
					price_full_presentation
					cost_price
					currency
					supplier_id
					presentation_id
					unit_of_measure_id
					units_per_presentation
					is_fractionable
				}
			}
			pageInfo {
				hasNextPage
				endCursor
			}
		}
	}
`;

export const UPDATE_MEDICINE_MUTATION = gql`
	mutation UpdateMedicine($input: UpdateMedicineInput!) {
		updateMedicine(input: $input) {
			result
			message
		}
	}
`;

export const UPDATE_BATCH_MUTATION = gql`
	mutation UpdateBatch($input: UpdateBatchInput!) {
		updateBatch(input: $input) {
			result
			message
		}
	}
`;

export const GET_SUPPLIERS_LIST_QUERY = gql`
	query GetSuppliersList {
		suppliers(first: 100, order: [{ company_name: ASC }]) {
			nodes {
				supplier_id
				company_name
			}
		}
	}
`;

export const GET_PRESENTATION_LIST_QUERY = gql`
	query GetPresentations {
		presentations(first: 100, order: [{ name: ASC }]) {
			nodes {
				presentation_id
				name
			}
		}
	}
`;

export const GET_BRANDS_LIST_QUERY = gql`
	query GetBrands {
		brands(first: 100, order: [{ name: ASC }]) {
			nodes {
				id_brand
				name
			}
		}
	}
`;

export const GET_MANUFACTURERS_LIST_QUERY = gql`
	query GetManufacturers {
		manufacturers(first: 100, order: [{ name: ASC }]) {
			nodes {
				manufacturer_id
				name
			}
		}
	}
`;

export const GET_CATEGORIES_LIST_QUERY = gql`
	query GetCategories {
		categories(first: 100, order: [{ name: ASC }]) {
			nodes {
				category_id
				name
			}
		}
	}
`;

export const GET_ADMINISTRATION_ROUTES_LIST_QUERY = gql`
	query GetAdministrationRoutes {
		administrationRoutes(first: 100, order: [{ name: ASC }]) {
			nodes {
				administration_route_id
				name
			}
		}
	}
`;

export const GET_ACTIVE_INGREDIENTS_LIST_QUERY = gql`
	query GetActiveIngredients {
		activeIngredients(first: 100, order: [{ name: ASC }]) {
			nodes {
				active_ingredient_id
				name
			}
		}
	}
`;

export const GET_DOSE_UNITS_LIST_QUERY = gql`
	query GetDoseUnits {
		doseUnits(first: 100, order: [{ name: ASC }]) {
			nodes {
				dose_unit_id
				name
				abbreviation
			}
		}
	}
`;

export const GET_UNIT_OF_MEASURE_LIST_QUERY = gql`
	query GetUnitOfMeasures {
		unitOfMeasures(first: 100, order: [{ name: ASC }]) {
			nodes {
				unit_of_measure_id
				name
			}
		}
	}
`;

export const GET_BATHCES_BY_PRODUCT_QUERY = () => gql`
	query GetBatches(
		$first: Int
		$after: String
		$order: [BatchSortInput!]
		$where: BatchFilterInput
	) {
		batches(first: $first, after: $after, order: $order, where: $where) {
			nodes {
				batch_id
				product_id
				batch_code
				expiration_date
				initial_quantity_units
				current_quantity_units
				is_active
				created_at
			}
			pageInfo {
				hasNextPage
				endCursor
			}
		}
	}
`;

export const ADD_BATCH_MUTATION = gql`
	mutation AddBatch($input: AddBatchInput!) {
		addBatch(input: $input) {
			result
			message
		}
	}
`;

export const GET_DASHBOARD_DAY_METRICS = gql`
	query GetDayMetrics($date: DateTime!) {
		totalSalesByDay(date: $date) {
			total
			percentage
		}

		numberOfSalesByDay(date: $date) {
			total
			percentage
		}
	}
`;

export const GET_DASHBOARD_SALE_SUMMARY = gql`
	query GetSalesStats(
		$startDate: DateTime!
		$endDate: DateTime!
		$type: FrequencyType!
	) {
		salesStats(startDate: $startDate, endDate: $endDate, type: $type) {
			label
			value
		}
	}
`;

export const GET_EMPLOYEE_BY_ID = () => gql`
	query GetEmployeeById($employeeId: Int!) {
		employee(employeeId: $employeeId) {
			employeeId
			names
			lastnames
			user
			email
			phone
			hiring_date
			url_photo
			employeeRoleId
			employeeStatusId
			employeeRole {
				name
			}
		}
	}
`;

export const GET_MECHANICS_QUERY = () => gql`
query {
	mechanics {
	nodes {
		mechanicId
		firstName
		lastName
		isActive
		specialty {
			specialtyId
			name
		}
	}
	pageInfo {
		hasNextPage
	}
	}
}
`;

export const ADD_MECHANIC_MUTATION = gql`
	mutation AddMechanic($firstName: String!, $lastName: String!, $specialtyId: Int!) {
		addMechanic(firstName: $firstName, lastName: $lastName, specialtyId: $specialtyId) {
			mechanicId
			firstName
			lastName
			isActive
			specialty {
				name
			}
		}
	}
`;

export const GET_MECHANIC_SPECIALTIES_QUERY = () => gql`
	query GetMechanicSpecialties {
		mechanicSpecialties {
			nodes {
				specialtyId
				name
			}
		}
	}
`;

export const UPDATE_MECHANIC_MUTATION = gql`
	mutation UpdateMechanic($mechanicId: Int!, $firstName: String!, $lastName: String!, $specialtyId: Int!) {
		updateMechanic(mechanicId: $mechanicId, firstName: $firstName, lastName: $lastName, specialtyId: $specialtyId) {
			mechanicId
			firstName
			lastName
			specialty {
				name
			}
		}
	}
`;

export const TOGGLE_MECHANIC_STATUS_MUTATION = gql`
	mutation ToggleMechanicStatus($mechanicId: Int!) {
		toggleMechanicStatus(mechanicId: $mechanicId) {
			mechanicId
			firstName
			isActive
		}
	}
`;

export const ADD_MECHANIC_SPECIALTY_MUTATION = gql`
	mutation AddMechanicSpecialty($name: String!) {
		addMechanicSpecialty(name: $name) {
			specialtyId
			name
		}
	}
`;

export const UPDATE_MECHANIC_SPECIALTY_MUTATION = gql`
	mutation UpdateMechanicSpecialty($specialtyId: Int!, $newName: String!) {
		updateMechanicSpecialty(specialtyId: $specialtyId, newName: $newName) {
			specialtyId
			name
		}
	}
`;

export const DELETE_MECHANIC_SPECIALTY_MUTATION = gql`
	mutation DeleteMechanicSpecialty($specialtyId: Int!) {
		deleteMechanicSpecialty(specialtyId: $specialtyId)
	}
`;

export const GET_COMPANIES_QUERY = () => gql`
	query {
		companies {
			nodes {
				companyId
				name
				taxId
				billingAddress
				contactEmail
				contactPhone
				defaultCurrency
				isActive
			}
			pageInfo {
				hasNextPage
				hasPreviousPage
			}
		}
	}
`;

export const ADD_COMPANY_MUTATION = gql`
	mutation AddCompany(
		$name: String!, 
		$taxId: String!, 
		$billingAddress: String!, 
		$contactEmail: String!, 
		$contactPhone: String!, 
		$defaultCurrency: String!, 
		$logoUrl: String!
	) {
		addCompany(
			name: $name, 
			taxId: $taxId, 
			billingAddress: $billingAddress, 
			contactEmail: $contactEmail, 
			contactPhone: $contactPhone, 
			defaultCurrency: $defaultCurrency, 
			logoUrl: $logoUrl
		) {
			companyId
			name
			isActive
		}
	}
`;

export const UPDATE_COMPANY_MUTATION = gql`
	mutation UpdateCompany(
		$companyId: Int!,
		$name: String!, 
		$taxId: String!, 
		$billingAddress: String!, 
		$contactEmail: String!, 
		$contactPhone: String!, 
		$defaultCurrency: String!, 
		$logoUrl: String!
	) {
		updateCompany(
			companyId: $companyId,
			name: $name, 
			taxId: $taxId, 
			billingAddress: $billingAddress, 
			contactEmail: $contactEmail, 
			contactPhone: $contactPhone, 
			defaultCurrency: $defaultCurrency, 
			logoUrl: $logoUrl
		) {
			companyId
			name
			billingAddress
		}
	}
`;

export const TOGGLE_COMPANY_STATUS_MUTATION = gql`
	mutation ToggleCompanyStatus($companyId: Int!) {
		toggleCompanyStatus(companyId: $companyId) {
			companyId
			name
			isActive
		}
	}
`;


