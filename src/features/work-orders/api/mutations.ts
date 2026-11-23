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

// actualizarOrden: un documento por dato. HotChocolate toma como null una variable declarada que no se envía, y en
// actualizarOrden null BORRA el campo: un documento con todas las variables borraba las firmas al guardar el nombre.
export const GUARDAR_FIRMA_ENTREGA = gql`
	mutation GuardarFirmaEntrega($workOrderId: Int!, $url: String!) {
		actualizarOrden(workOrderId: $workOrderId, dropoffSignatureUrl: $url) { workOrderId }
	}
`;

export const GUARDAR_FIRMA_RECOGE = gql`
	mutation GuardarFirmaRecoge($workOrderId: Int!, $url: String!) {
		actualizarOrden(workOrderId: $workOrderId, pickupSignatureUrl: $url) { workOrderId }
	}
`;

export const GUARDAR_QUIEN_ENTREGA = gql`
	mutation GuardarQuienEntrega($workOrderId: Int!, $name: String!) {
		actualizarOrden(workOrderId: $workOrderId, dropoffDriverName: $name) { workOrderId }
	}
`;

export const GUARDAR_QUIEN_RECOGE = gql`
	mutation GuardarQuienRecoge($workOrderId: Int!, $name: String!) {
		actualizarOrden(workOrderId: $workOrderId, pickupDriverName: $name) { workOrderId }
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
