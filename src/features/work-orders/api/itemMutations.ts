import { gql } from "@apollo/client";

// Repuestos y servicios de una orden (WorkOrderItemMutations.cs). Devuelven la orden con totales recalculados.

export const AGREGAR_REPUESTO = gql`
	mutation AgregarRepuestoOrden($workOrderId: Int!, $partId: Int!, $quantity: Int!, $totalUnitCost: Decimal, $unitPrice: Decimal) {
		agregarRepuestoOrden(
			workOrderId: $workOrderId
			partId: $partId
			quantity: $quantity
			totalUnitCost: $totalUnitCost
			unitPrice: $unitPrice
		) {
			workOrderId
			totalInternalCost
			totalBilledPrice
		}
	}
`;

export const EDITAR_REPUESTO = gql`
	mutation EditarRepuestoOrden($workOrderPartId: Int!, $quantity: Int, $totalUnitCost: Decimal, $unitPrice: Decimal) {
		editarRepuestoOrden(
			workOrderPartId: $workOrderPartId
			quantity: $quantity
			totalUnitCost: $totalUnitCost
			unitPrice: $unitPrice
		) {
			workOrderId
			totalInternalCost
			totalBilledPrice
		}
	}
`;

export const QUITAR_REPUESTO = gql`
	mutation QuitarRepuestoOrden($workOrderPartId: Int!) {
		quitarRepuestoOrden(workOrderPartId: $workOrderPartId) {
			workOrderId
			totalInternalCost
			totalBilledPrice
		}
	}
`;

export const AGREGAR_SERVICIO = gql`
	mutation AgregarServicioOrden($workOrderId: Int!, $description: String!, $internalCost: Decimal!, $price: Decimal!, $mechanicId: Int) {
		agregarServicioOrden(
			workOrderId: $workOrderId
			description: $description
			internalCost: $internalCost
			price: $price
			mechanicId: $mechanicId
		) {
			workOrderId
			totalInternalCost
			totalBilledPrice
		}
	}
`;

// mechanicId es Optional en el backend: omitirlo lo deja igual; null quita el mecánico.
export const EDITAR_SERVICIO = gql`
	mutation EditarServicioOrden($workOrderServiceId: Int!, $description: String, $internalCost: Decimal, $price: Decimal, $mechanicId: Int) {
		editarServicioOrden(
			workOrderServiceId: $workOrderServiceId
			description: $description
			internalCost: $internalCost
			price: $price
			mechanicId: $mechanicId
		) {
			workOrderId
			totalInternalCost
			totalBilledPrice
		}
	}
`;

export const QUITAR_SERVICIO = gql`
	mutation QuitarServicioOrden($workOrderServiceId: Int!) {
		quitarServicioOrden(workOrderServiceId: $workOrderServiceId) {
			workOrderId
			totalInternalCost
			totalBilledPrice
		}
	}
`;
