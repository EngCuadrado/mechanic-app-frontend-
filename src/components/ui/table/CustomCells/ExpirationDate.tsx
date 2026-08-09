import { nicaDate, nowInNica } from "../../../../utils/dateUtils";

interface BatchExpirationProps {
	expirationDate: string; // La fecha que viene de la base de datos
}

const BatchExpiration = ({ expirationDate }: BatchExpirationProps) => {
	const exp = nicaDate(expirationDate);
	const today = nowInNica();

	// Calculamos la diferencia en días para la lógica de colores
	const diffDays = exp.diff(today, "days");

	// Configuramos el estilo según la urgencia
	let statusStyles = "bg-green-100 text-green-700"; // Caso por defecto (Seguro)
	let label = "Seguro";

	if (diffDays <= 0) {
		// CASO 1: YA VENCIDO
		statusStyles =
			"bg-red-100 text-red-700 font-bold border border-red-200";
		label = "VENCIDO";
	} else if (diffDays <= 90) {
		// CASO 2: VENCE EN MENOS DE 3 MESES (90 DÍAS)
		statusStyles = "bg-orange-100 text-orange-700 border border-orange-200";
		label = "CRÍTICO";
	} else if (diffDays <= 180) {
		// CASO 3: VENCE EN MENOS DE 6 MESES (180 DÍAS)
		statusStyles = "bg-yellow-100 text-yellow-700 border border-yellow-200";
		label = "REVISAR";
	}

	return (
		<div className="flex flex-col gap-1 min-w-[140px]">
			{/* Fecha formateada: 12 Oct 2026 */}
			<span className="text-sm font-semibold text-gray-800 dark:text-white capitalize">
				{exp.format("DD MMM YYYY")}
			</span>

			{/* Badge con color y texto relativo (ej: "hace 2 días" o "en 3 meses") */}
			<div
				className={`text-[10px] px-2 py-0.5 rounded-md w-fit uppercase tracking-wider ${statusStyles}`}
			>
				<span className="font-black">{label}</span>
				<span className="mx-1">•</span>
				<span>{exp.fromNow()}</span>
			</div>
		</div>
	);
};

export default BatchExpiration;
