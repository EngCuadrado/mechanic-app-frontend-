export interface InventoryMovement {
	movementId: number;
	movementType: string;
	quantity: number;
	unitCost: number | null;
	workOrderId: number | null;
	createdAt: string | null;
}
