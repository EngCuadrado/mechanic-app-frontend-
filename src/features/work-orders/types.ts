export interface VehicleLite {
	vehicleId: number;
	plate: string | null;
	currentMilage?: number | null;
	model?: { modelName: string; brand?: { brandName: string } | null } | null;
}

export interface WorkOrderSummary {
	workOrderId: number;
	type: string;
	currentStatus: string;
	entryTimestamp: string;
	totalBilledPrice: number | null;
	vehicle?: VehicleLite | null;
	company?: { name: string | null } | null;
}

export interface WorkOrderPart {
	workOrderPartId: number;
	partId: number;
	quantity: number;
	totalUnitCost: number;
	unitPrice: number;
	part?: { name: string | null; stockQuantity: number } | null;
}

export interface WorkOrderService {
	workOrderServiceId: number;
	description: string | null;
	internalCost: number | null;
	price: number | null;
	mechanicId: number | null;
	mechanic?: { firstName: string | null; lastName: string | null } | null;
}

export interface InspectionSummary {
	vehicleInspectionId: number;
	inspectionType: string;
	mileage: number | null;
	inspectionNotes: string | null;
	createdAt: string | null;
}

export interface WorkOrderDetail {
	workOrderId: number;
	vehicleId: number;
	companyId: number | null;
	rentalId: number | null;
	type: string;
	currentStatus: string;
	reportedIssue: string | null;
	notes: string | null;
	dropoffDriverName: string | null;
	pickupDriverName: string | null;
	dropoffSignatureUrl: string | null;
	pickupSignatureUrl: string | null;
	entryTimestamp: string;
	exitTimestamp: string | null;
	totalInternalCost: number | null;
	totalBilledPrice: number | null;
	creator?: { name: string | null; lastName: string | null } | null;
	vehicle?: VehicleLite | null;
	company?: { name: string | null } | null;
	parts: WorkOrderPart[];
	services: WorkOrderService[];
	inspections: InspectionSummary[];
}
