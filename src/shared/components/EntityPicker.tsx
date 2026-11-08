import { useState, type ReactNode } from "react";
import type { DocumentNode } from "graphql";
import { useIntl } from "react-intl";
import Input from "../../components/form/input/InputField";
import Loading from "../../components/ui/loading/Loading";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useLoadMoreList } from "../hooks/useLoadMoreList";
import EmptyState from "./EmptyState";

interface EntityPickerProps<T> {
	query: DocumentNode;
	/** Campo de conexión de la query (ej. "vehicles"). */
	field: string;
	idKey: string;
	/** Convierte el texto buscado en el `where` de la query. */
	buildWhere: (text: string) => Record<string, unknown> | undefined;
	renderItem: (item: T) => ReactNode;
	onSelect: (item: T) => void;
	placeholder: string;
}

/** Buscador con lista táctil, reutilizable para vehículos, repuestos, mecánicos, alquileres… Va dentro de un BottomSheet. */
export default function EntityPicker<T extends Record<string, any>>({
	query,
	field,
	idKey,
	buildWhere,
	renderItem,
	onSelect,
	placeholder,
}: EntityPickerProps<T>) {
	const intl = useIntl();
	const [text, setText] = useState("");
	const search = useDebouncedValue(text.trim());
	const { items, loading, hasMore, loadMore } = useLoadMoreList<T>({
		query,
		field,
		idKey,
		variables: { where: buildWhere(search) },
	});

	return (
		<div className="flex flex-col gap-3">
			<Input
				type="search"
				placeholder={placeholder}
				value={text}
				autoComplete="off"
				onChange={(e) => setText(e.target.value)}
			/>
			<ul className="flex flex-col gap-2">
				{items.map((item) => (
					<li key={String(item[idKey])}>
						<button
							type="button"
							onClick={() => onSelect(item)}
							className="min-h-14 w-full cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
						>
							{renderItem(item)}
						</button>
					</li>
				))}
			</ul>
			{loading && <Loading size="sm" />}
			{!loading && items.length === 0 && (
				<EmptyState text={intl.formatMessage({ id: "common.noResults", defaultMessage: "Sin resultados" })} />
			)}
			{hasMore && (
				<button
					type="button"
					onClick={loadMore}
					className="min-h-11 cursor-pointer rounded-xl text-sm font-medium text-brand-500"
				>
					{intl.formatMessage({ id: "common.loadMore", defaultMessage: "Ver más" })}
				</button>
			)}
		</div>
	);
}
