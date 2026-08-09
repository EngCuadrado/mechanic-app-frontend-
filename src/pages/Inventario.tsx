import { useIntl } from "react-intl"; // 1. Importar el hook
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Inventario() {
	// 2. Crear la instancia para acceder a tus traducciones
	const intl = useIntl();

	return (
		<div>
			{/* 3. "Llamar" a la variable del JSON usando su ID */}
			<PageBreadcrumb
				pageTitle={intl.formatMessage({ id: "inventory" })}
			/>

			<div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
				<div className="mx-auto w-full max-w-[630px] text-center">
					{/* Tu contenido */}
				</div>
			</div>
		</div>
	);
}
