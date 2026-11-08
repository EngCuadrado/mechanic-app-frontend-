import { useQuery } from "@apollo/client/react";
import { GET_WORK_ORDERS } from "../api/queries";
import { dayStartUtc } from "../../../shared/utils/dates";
import { nicaDate } from "../../../utils/dateUtils";
import type { WorkOrderSummary } from "../types";

/** Órdenes abiertas más las entregadas hoy (hay pocas a la vez, por eso una sola página). */
export function useBoardOrders() {
	const { data, loading, error } = useQuery<{ workOrders: { nodes: WorkOrderSummary[] } }>(GET_WORK_ORDERS, {
		variables: { first: 50, order: [{ workOrderId: "DESC" }], where: {
				or: [
					{ currentStatus: { in: ["Recibido", "En proceso", "Listo"] } },
					{ and: [{ currentStatus: { eq: "Entregado" } }, { exitTimestamp: { gte: dayStartUtc(nicaDate().format("YYYY-MM-DD")) } }] },
				],
			},
		},
		fetchPolicy: "cache-and-network",
	});
	return { orders: data?.workOrders?.nodes ?? [], loading, error };
}
