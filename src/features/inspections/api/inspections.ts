import { gql } from "@apollo/client";

export const GET_INSPECTION_FORM = gql`
	query GetInspectionForm($id: Int) {
		inspectionForm(vehicleInspectionId: $id) {
			inspection { vehicleInspectionId inspectionType mileage inspectionNotes }
			groups {
				category { name sortOrder }
				items { item { itemId name inputType options isRequired } value notes }
			}
		}
	}
`;

export const CREAR_INSPECCION = gql`
	mutation CrearInspeccion($workOrderId: Int!, $inspectionType: String!, $mileage: Int, $inspectionNotes: String) {
		crearInspeccion(workOrderId: $workOrderId, inspectionType: $inspectionType, mileage: $mileage, inspectionNotes: $inspectionNotes) {
			vehicleInspectionId
		}
	}
`;

export const GUARDAR_RESULTADOS = gql`
	mutation GuardarResultadosInspeccion($id: Int!, $results: [InspectionResultInput!]!, $validar: Boolean) {
		guardarResultadosInspeccion(vehicleInspectionId: $id, results: $results, validarCompletitud: $validar) {
			groups { items { item { itemId } value notes } }
		}
	}
`;

// Solo para saber si la orden está cerrada (la inspección se bloquea igual que la orden).
export const GET_ORDER_STATUS = gql`
	query GetOrderStatus($id: Int!) {
		workOrder(workOrderId: $id) { workOrderId currentStatus }
	}
`;
