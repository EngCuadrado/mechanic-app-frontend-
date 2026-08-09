// src/types/graphql.ts

// Estructura genérica de la paginación de GraphQL
export interface PageInfo {
	hasNextPage: boolean;
	endCursor: string | null;
	// startCursor y hasPreviousPage son opcionales según tu API,
	// pero útiles si quieres paginar hacia atrás con query real.
}

// Estructura genérica de la respuesta de una lista
export interface GraphQLConnection<T> {
	nodes: T[];
	pageInfo: PageInfo;
}

// Props que recibirá nuestro componente genérico
export interface ServerDataTableProps<T> {
	columns: any[]; // ColumnDef<T>[] de TanStack
	query: string; // La query de GraphQL cruda
	queryName: string; // El nombre del campo en la respuesta (ej: "employees")
	pageSize?: number;
}
