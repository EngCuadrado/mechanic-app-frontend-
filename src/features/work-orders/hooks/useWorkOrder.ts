import { useQuery } from "@apollo/client/react";
import { GET_WORK_ORDER } from "../api/queries";
import type { WorkOrderDetail } from "../types";

export function useWorkOrder(id: number) {
	const { data, loading, error } = useQuery<{ workOrder: WorkOrderDetail | null }>(GET_WORK_ORDER, {
		variables: { id },
		skip: !Number.isFinite(id),
	});
	return { order: data?.workOrder ?? null, loading, error };
}
