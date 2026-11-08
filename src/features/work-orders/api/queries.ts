import { gql } from "@apollo/client";

// Compatible con ServerDataTable (declara $order y $where) y con useLoadMoreList.
export const GET_WORK_ORDERS = gql`
	query GetWorkOrders($first: Int, $after: String, $order: [WorkOrderSortInput!], $where: WorkOrderFilterInput) {
		workOrders(first: $first, after: $after, order: $order, where: $where) {
			nodes {
				workOrderId
				type
				currentStatus
				entryTimestamp
				totalBilledPrice
				vehicle { vehicleId plate model { modelName brand { brandName } } }
				company { name }
			}
			pageInfo { hasNextPage endCursor }
		}
	}
`;

export const GET_WORK_ORDER = gql`
	query GetWorkOrder($id: Int!) {
		workOrder(workOrderId: $id) {
			workOrderId
			vehicleId
			companyId
			rentalId
			type
			currentStatus
			reportedIssue
			notes
			dropoffDriverName
			pickupDriverName
			dropoffSignatureUrl
			pickupSignatureUrl
			entryTimestamp
			exitTimestamp
			totalInternalCost
			totalBilledPrice
			creator { name lastName }
			vehicle { vehicleId plate currentMilage model { modelName brand { brandName } } }
			company { name }
			parts {
				workOrderPartId
				partId
				quantity
				totalUnitCost
				unitPrice
				part { name stockQuantity }
			}
			services {
				workOrderServiceId
				description
				internalCost
				price
				mechanicId
				mechanic { firstName lastName }
			}
			inspections { vehicleInspectionId inspectionType mileage inspectionNotes createdAt }
		}
	}
`;
