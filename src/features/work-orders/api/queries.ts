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
				reportedIssue
				totalBilledPrice
				dropoffSignatureUrl
				vehicle { vehicleId plate model { modelName brand { brandName } } }
				company { name }
				services { description }
				assignedMechanics { mechanicId firstName lastName }
			}
			pageInfo { hasNextPage endCursor }
		}
	}
`;

// Una fila por cada estado (con 0 incluido), calculada en la base de datos.
export const GET_WORK_ORDER_STATUS_COUNTS = gql`
	query GetWorkOrderStatusCounts {
		workOrderStatusCounts {
			status
			count
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
