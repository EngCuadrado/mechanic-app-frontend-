import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import type { DocumentNode } from "graphql";

interface Options {
	query: DocumentNode;
	/** Nombre del campo de conexión en la respuesta (ej. "workOrders"). */
	field: string;
	/** Clave única de cada nodo (ej. "workOrderId"). */
	idKey: string;
	variables?: Record<string, unknown>;
	pageSize?: number;
}

/**
 * Lista con "Ver más" para pantallas móviles: acumula páginas de una conexión con cursor.
 * Se reinicia sola cuando cambian las variables.
 */
export function useLoadMoreList<T extends Record<string, any>>({
	query,
	field,
	idKey,
	variables,
	pageSize = 15,
}: Options) {
	const [after, setAfter] = useState<string | null>(null);
	const [items, setItems] = useState<T[]>([]);
	const varsKey = JSON.stringify(variables ?? {});

	useEffect(() => {
		setAfter(null);
		setItems([]);
	}, [varsKey]);

	const { data, loading, error, refetch } = useQuery<Record<string, any>>(query, {
		variables: { ...variables, first: pageSize, after },
		fetchPolicy: "cache-and-network",
	});

	const connection = data?.[field];

	useEffect(() => {
		if (!connection?.nodes) return;
		setItems((prev) => {
			const byId = new Map<unknown, T>(prev.map((i) => [i[idKey], i]));
			for (const node of connection.nodes as T[]) byId.set(node[idKey], node);
			return Array.from(byId.values());
		});
	}, [connection, idKey]);

	return {
		items,
		loading,
		error,
		hasMore: Boolean(connection?.pageInfo?.hasNextPage),
		loadMore: () => connection?.pageInfo?.endCursor && setAfter(connection.pageInfo.endCursor),
		reload: () => {
			setAfter(null);
			setItems([]);
			return refetch();
		},
	};
}
