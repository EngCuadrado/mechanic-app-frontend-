import { useState, useMemo } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { useQuery } from "@apollo/client/react";
import { ServerDataTable } from "../../ui/table/ServerDataTable";
import { 
	GET_MEDICINE_QUERY,
	GET_CATEGORIES_LIST_QUERY,
	GET_ADMINISTRATION_ROUTES_LIST_QUERY,
	GET_ACTIVE_INGREDIENTS_LIST_QUERY
} from "../../ui/table/QuerysDefinitions";
import { useMedicineColumns } from "../../ui/table/ColumnsDefinitions";
import Select from "../../form/Select";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function MedicineTable() {
	const intl = useIntl();
	
	// --- FILTER STATE ---
	const [nameFilter, setNameFilter] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [routeFilter, setAdministrationRouteFilter] = useState("");
	const [ingredientFilter, setActiveIngredientFilter] = useState("");

	// --- OPTIONS QUERIES ---
	const { data: categoriesData } = useQuery(GET_CATEGORIES_LIST_QUERY);
	const { data: routesData } = useQuery(GET_ADMINISTRATION_ROUTES_LIST_QUERY);
	const { data: ingredientsData } = useQuery(GET_ACTIVE_INGREDIENTS_LIST_QUERY);

	const query = GET_MEDICINE_QUERY();
	const columns = useMedicineColumns();

	// --- OPTIONS MAPPING ---
	const categoriesOptions = useMemo(() => {
		const nodes = categoriesData?.categories?.nodes || [];
		return [
			{ value: "ALL", label: intl.formatMessage({ id: "categories" }, { count: 2 }) },
			...nodes.map((n: any) => ({ value: String(n.category_id), label: n.name }))
		];
	}, [categoriesData, intl]);

	const routesOptions = useMemo(() => {
		const nodes = routesData?.administrationRoutes?.nodes || [];
		return [
			{ value: "ALL", label: intl.formatMessage({ id: "administration_routes" }, { count: 2 }) },
			...nodes.map((n: any) => ({ value: String(n.administration_route_id), label: n.name }))
		];
	}, [routesData, intl]);

	const ingredientsOptions = useMemo(() => {
		const nodes = ingredientsData?.activeIngredients?.nodes || [];
		return [
			{ value: "ALL", label: intl.formatMessage({ id: "active_ingredients" }, { count: 2 }) },
			...nodes.map((n: any) => ({ value: String(n.active_ingredient_id), label: n.name }))
		];
	}, [ingredientsData, intl]);

	// --- FILTER BUILDING ---
	const filter = useMemo(() => {
		const and: any[] = [];

		if (nameFilter.trim()) {
			and.push({ name: { contains: nameFilter.trim() } });
		}

		if (categoryFilter && categoryFilter !== "ALL") {
			and.push({ category_id: { eq: parseInt(categoryFilter) } });
		}

		if (routeFilter && routeFilter !== "ALL") {
			and.push({ administration_route_id: { eq: parseInt(routeFilter) } });
		}

		if (ingredientFilter && ingredientFilter !== "ALL") {
			and.push({
				medicine_active_ingredients: {
					some: {
						active_ingredient_id: { eq: parseInt(ingredientFilter) }
					}
				}
			});
		}

		return and.length > 0 ? { and } : null;
	}, [nameFilter, categoryFilter, routeFilter, ingredientFilter]);

	const clearFilters = () => {
		setNameFilter("");
		setCategoryFilter("ALL");
		setAdministrationRouteFilter("ALL");
		setActiveIngredientFilter("ALL");
	};

	const isFiltered = nameFilter || (categoryFilter && categoryFilter !== "ALL") || 
					  (routeFilter && routeFilter !== "ALL") || (ingredientFilter && ingredientFilter !== "ALL");

return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                <FormattedMessage id="medicines" values={{ count: 2 }} />
                            </h3>
                        </div>
                        {isFiltered && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 transition-colors w-max"
                            >
                                <XMarkIcon className="size-4" />
                                <FormattedMessage id="cancel" />
                            </button>
                        )}
                    </div>

                    {/* Contenedor Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        {/* 1. Input de Búsqueda */}
                        <div id="tour-med-search" className="w-full flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {intl.formatMessage({ id: "name" })}
                            </label>
                            <input
                                type="text"
                                placeholder={intl.formatMessage({ id: "search" })}
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            />
                        </div>

                        {/* 2. Select de Categorías */}
                        <div id="tour-med-category" className="w-full flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                <FormattedMessage id="category" defaultMessage="Categoría" />
                            </label>
                            <Select
                                options={categoriesOptions}
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                            />
                        </div>

                        {/* 3. Select de Vías de Administración */}
                        <div id="tour-med-route" className="w-full flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                <FormattedMessage id="route" defaultMessage="Vía de Administración" />
                            </label>
                            <Select
                                options={routesOptions}
                                value={routeFilter}
                                onChange={setAdministrationRouteFilter}
                            />
                        </div>

                        {/* 4. Select de Ingredientes Activos */}
                        <div id="tour-med-ingredient" className="w-full flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                <FormattedMessage id="active_ingredient" defaultMessage="Ingrediente Activo" />
                            </label>
                            <Select
                                options={ingredientsOptions}
                                value={ingredientFilter}
                                onChange={setActiveIngredientFilter}
                            />
                        </div>

                    </div>
                </div>
            </div>

            <div id="tour-med-table">
                <ServerDataTable
                    columns={columns}
                    query={query}
                    queryKeyName="medicines"
                    filter={filter}
                />
            </div>
        </div>
    );
}
