import type { IntlShape } from "react-intl";

export interface ApiError {
	message: string;
	code?: string;
}

// Códigos que el backend devuelve en extensions.code → id de mensaje en es.json.
const CODE_MESSAGE_IDS: Record<string, string> = {
	INSUFFICIENT_STOCK: "api.error.insufficientStock",
	ORDER_CLOSED: "api.error.orderClosed",
	OPEN_ORDER_EXISTS: "api.error.openOrderExists",
	INSPECTION_EXISTS: "api.error.inspectionExists",
	RESULT_EXISTS: "api.error.resultExists",
};

/** Extrae mensaje y código de un error de Apollo o de un arreglo `errors` de GraphQL. */
export function getApiError(err: unknown): ApiError {
	// biome-ignore lint: la forma del error depende de la versión de Apollo
	const e = err as any;
	const first = e?.errors?.[0] ?? e?.graphQLErrors?.[0] ?? e?.cause?.errors?.[0];
	return {
		message: first?.message ?? e?.message ?? "",
		code: first?.extensions?.code,
	};
}

/** Mensaje para el usuario. Nunca incluye stackTrace ni detalles internos. */
export function apiErrorMessage(intl: IntlShape, err: unknown): string {
	const { message, code } = getApiError(err);
	const id = code ? CODE_MESSAGE_IDS[code] : undefined;
	if (id) return intl.formatMessage({ id });
	if (!message || /unexpected execution error/i.test(message)) {
		return intl.formatMessage({ id: "api.error.generic" });
	}
	return message;
}
