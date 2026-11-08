import { useQuery } from "@apollo/client/react";
import { GET_WORK_ORDER_STATUS_COUNTS } from "../api/queries";

/** Conteo por estado calculado por el backend (GROUP BY). */
export function useStatusCounts() {
	const { data } = useQuery<{ workOrderStatusCounts: { status: string; count: number }[] }>(GET_WORK_ORDER_STATUS_COUNTS, {
		fetchPolicy: "cache-and-network",
	});
	return Object.fromEntries((data?.workOrderStatusCounts ?? []).map((c) => [c.status, c.count])) as Record<string, number>;
}
