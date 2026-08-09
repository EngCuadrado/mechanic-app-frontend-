// src/hooks/useGraphQLPagination.ts
import { useState, useCallback } from "react";

export const useGraphQLPagination = (initialPageSize: number = 5) => {
	const [pageSize, setPageSize] = useState(initialPageSize);

	// Historial de cursores para poder regresar
	// stack[0] es siempre null (primera página)
	const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);

	// El cursor actual es el último del stack
	const currentCursor = cursorStack[cursorStack.length - 1];

	// Ir a la siguiente página
	const onNextPage = useCallback((nextCursor: string) => {
		setCursorStack((prev) => [...prev, nextCursor]);
	}, []);

	// Ir a la página anterior (simplemente sacamos el último cursor del stack)
	const onPreviousPage = useCallback(() => {
		if (cursorStack.length > 1) {
			setCursorStack((prev) => prev.slice(0, -1));
		}
	}, [cursorStack.length]);

	// Resetear a la primera página (útil al filtrar)
	const resetPagination = useCallback(() => {
		setCursorStack([null]);
	}, []);

	return {
		pageSize,
		setPageSize,
		currentCursor,
		onNextPage,
		onPreviousPage,
		resetPagination,
		hasPreviousPage: cursorStack.length > 1,
		pageIndex: cursorStack.length - 1, // Solo referencial
	};
};
