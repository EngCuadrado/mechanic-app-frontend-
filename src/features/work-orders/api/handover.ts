import { gql } from "@apollo/client";

// La firma se sube como foto de la orden (Azure Blob) y su URL se guarda con actualizarOrden.
export const UPLOAD_SIGNATURE = gql`
	mutation UploadSignature($workOrderId: Int!, $stage: String!, $category: String, $photoFile: Upload) {
		registrarFotoOrden(workOrderId: $workOrderId, stage: $stage, category: $category, photoFile: $photoFile) {
			workOrderPhotoId
			photoUrl
		}
	}
`;
