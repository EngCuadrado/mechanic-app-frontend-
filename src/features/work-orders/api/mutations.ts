import { gql } from "@apollo/client";

// Argumentos verificados contra mechanic-app-backend (WorkOrderMutations.cs).

export const CREAR_ORDEN = gql`
	mutation CrearOrden(
		$vehicleId: Int!
		$type: String!
		$reportedIssue: String
		$notes: String
		$dropoffDriverName: String
		$rentalId: Int
	) {
		crearOrden(
			vehicleId: $vehicleId
			type: $type
			reportedIssue: $reportedIssue
			notes: $notes
			dropoffDriverName: $dropoffDriverName
			rentalId: $rentalId
		) {
			workOrderId
			currentStatus
		}
	}
`;

// Los argumentos Optional del backend: lo que no se envía no cambia; null lo borra.
export const ACTUALIZAR_ORDEN = gql`
	mutation ActualizarOrden(
		$workOrderId: Int!
		$reportedIssue: String
		$notes: String
		$dropoffDriverName: String
		$pickupDriverName: String
		$dropoffSignatureUrl: String
		$pickupSignatureUrl: String
	) {
		actualizarOrden(
			workOrderId: $workOrderId
			reportedIssue: $reportedIssue
			notes: $notes
			dropoffDriverName: $dropoffDriverName
			pickupDriverName: $pickupDriverName
			dropoffSignatureUrl: $dropoffSignatureUrl
			pickupSignatureUrl: $pickupSignatureUrl
		) {
			workOrderId
		}
	}
`;

export const CAMBIAR_ESTADO_ORDEN = gql`
	mutation CambiarEstadoOrden($workOrderId: Int!, $newStatus: String!) {
		cambiarEstadoOrden(workOrderId: $workOrderId, newStatus: $newStatus) {
			workOrderId
			currentStatus
			exitTimestamp
		}
	}
`;

export const CANCELAR_ORDEN = gql`
	mutation CancelarOrden($workOrderId: Int!) {
		cancelarOrden(workOrderId: $workOrderId) {
			workOrderId
			currentStatus
		}
	}
`;
