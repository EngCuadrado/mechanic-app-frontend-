import { useQuery } from "@apollo/client/react";
import { GET_WORK_ORDERS } from "../api/queries";

/** Orden abierta (no entregada ni cancelada) de un vehículo, si la hay. El backend rechaza una segunda (OPEN_ORDER_EXISTS). */
export function useOpenOrder(vehicleId: number | null) {
	const { data } = useQuery<{ workOrders: { nodes: { workOrderId: number }[] } }>(GET_WORK_ORDERS, {
		variables: {
			first: 1,
			where: { vehicleId: { eq: vehicleId }, currentStatus: { in: ["Recibido", "En proceso", "Listo"] } },
		},
		skip: vehicleId === null,
		fetchPolicy: "network-only",
	});
	return vehicleId === null ? null : (data?.workOrders.nodes[0]?.workOrderId ?? null);
}
