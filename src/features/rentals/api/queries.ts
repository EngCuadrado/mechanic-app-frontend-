import { gql } from "@apollo/client";

export const GET_RENTALS = gql`
	query GetRentals($first: Int, $after: String, $where: VehicleRentalFilterInput) {
		vehicleRentals(first: $first, after: $after, where: $where) {
			nodes { id status startDate company { name } vehicle { plate } }
			pageInfo { hasNextPage endCursor }
		}
	}
`;
