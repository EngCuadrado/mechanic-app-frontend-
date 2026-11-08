import { gql } from "@apollo/client";

export const GET_INVENTORY_MOVEMENTS = gql`
	query GetInventoryMovements($partId: Int!, $first: Int, $after: String) {
		inventoryMovements(partId: $partId, first: $first, after: $after) {
			nodes { movementId movementType quantity unitCost workOrderId createdAt }
			pageInfo { hasNextPage endCursor }
		}
	}
`;

export const GET_INVENTORY_PART = gql`
	query GetInventoryPartStock($id: Int!) {
		inventoryParts(where: { inventoryPartId: { eq: $id } }, first: 1) {
			nodes { inventoryPartId name stockQuantity }
		}
	}
`;

export const REGISTRAR_MOVIMIENTO = gql`
	mutation RegistrarMovimiento($partId: Int!, $movementType: String!, $quantity: Int!, $unitCost: Decimal) {
		registrarMovimiento(partId: $partId, movementType: $movementType, quantity: $quantity, unitCost: $unitCost) {
			movementId
			part { inventoryPartId stockQuantity }
		}
	}
`;

export const GET_STOCK_CHECK = gql`
	query GetStockCheck {
		inventoryStockCheck { isConsistent rows { cells { name value } } }
	}
`;
