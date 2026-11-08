import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import type { OperationVariables } from "@apollo/client";
import type { DocumentNode } from "graphql";
import { useIntl } from "react-intl";
import { toast } from "sonner";
import { apiErrorMessage } from "../utils/apiError";

interface Options {
	/** Nombres de queries a refrescar al terminar (ej. ["GetWorkOrder"]). */
	refetchQueries?: string[];
	/** id de es.json para un toast de éxito (opcional). */
	successMessageId?: string;
}

/**
 * Envuelve useMutation: muestra el error traducido en un toast y devuelve `null` si falló,
 * o los datos si funcionó. Las pantallas no repiten el try/catch.
 */
export function useApiMutation<TData = any, TVars extends OperationVariables = OperationVariables>(
	document: DocumentNode,
	options: Options = {},
) {
	const intl = useIntl();
	const [mutate, { loading }] = useMutation<TData, TVars>(document);
	const { refetchQueries, successMessageId } = options;

	const run = useCallback(
		async (variables: TVars): Promise<TData | null> => {
			try {
				const result = await mutate({ variables, refetchQueries, awaitRefetchQueries: true });
				if (successMessageId) toast.success(intl.formatMessage({ id: successMessageId }));
				return (result.data ?? null) as TData | null;
			} catch (err) {
				toast.error(apiErrorMessage(intl, err));
				return null;
			}
		},
		[mutate, intl, refetchQueries, successMessageId],
	);

	return [run, loading] as const;
}
