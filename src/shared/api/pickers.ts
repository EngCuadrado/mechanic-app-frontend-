import { gql } from "@apollo/client";

// Consultas mínimas para los buscadores (EntityPicker). Solo los campos que muestra cada lista.

export const SEARCH_VEHICLES = gql`
	query SearchVehicles($first: Int, $after: String, $where: VehicleFilterInput) {
		vehicles(first: $first, after: $after, where: $where) {
			nodes {
				vehicleId
				plate
				companyId
				model { modelName brand { brandName } }
				company { name }
			}
			pageInfo { hasNextPage endCursor }
		}
	}
`;

export const SEARCH_PARTS = gql`
	query SearchParts($first: Int, $after: String, $where: InventoryPartFilterInput) {
		inventoryParts(first: $first, after: $after, where: $where) {
			nodes {
				inventoryPartId
				name
				stockQuantity
				basePrice
				totalUnitCost
				currency
			}
			pageInfo { hasNextPage endCursor }
		}
	}
`;

export const SEARCH_MECHANICS = gql`
	query SearchMechanics($first: Int, $after: String, $where: MechanicsFilterInput) {
		mechanics(first: $first, after: $after, where: $where) {
			nodes { mechanicId firstName lastName }
			pageInfo { hasNextPage endCursor }
		}
	}
`;

export const SEARCH_COMPANIES = gql`
	query SearchCompanies($first: Int, $after: String, $where: CompanyFilterInput) {
		companies(first: $first, after: $after, where: $where) {
			nodes { companyId name }
			pageInfo { hasNextPage endCursor }
		}
	}
`;

export const SEARCH_RENTALS = gql`
	query SearchRentals($first: Int, $after: String, $where: VehicleRentalFilterInput) {
		vehicleRentals(first: $first, after: $after, where: $where) {
			nodes {
				id
				status
				startDate
				company { name }
				vehicle { plate }
			}
			pageInfo { hasNextPage endCursor }
		}
	}
`;
