import { gql } from "@apollo/client";

export const GET_WORK_ORDER_PHOTOS = gql`
	query GetWorkOrderPhotos($workOrderId: Int!) {
		workOrderPhotos(workOrderId: $workOrderId) {
			stage
			photos { workOrderPhotoId photoUrl category vehicleInspectionId }
		}
	}
`;

export const REGISTRAR_FOTO = gql`
	mutation RegistrarFotoOrden($workOrderId: Int!, $stage: String!, $category: String, $vehicleInspectionId: Int, $photoFile: Upload) {
		registrarFotoOrden(workOrderId: $workOrderId, stage: $stage, category: $category, vehicleInspectionId: $vehicleInspectionId, photoFile: $photoFile) {
			workOrderPhotoId
			photoUrl
		}
	}
`;

export const ELIMINAR_FOTO = gql`
	mutation EliminarFotoOrden($workOrderPhotoId: Int!) {
		eliminarFotoOrden(workOrderPhotoId: $workOrderPhotoId)
	}
`;
