import { memo } from "react";
import { useIntl } from "react-intl";
import Badge from "../../badge/Badge";
import {
	BeakerIcon,
	ChatBubbleBottomCenterTextIcon,
	BoltIcon,
	ArrowDownCircleIcon,
	CloudIcon,
	FaceSmileIcon,
	HandRaisedIcon,
	EyeIcon,
	SpeakerWaveIcon,
} from "@heroicons/react/24/outline";

import {
	TbPill,
	TbVaccine,
	TbLungs,
	TbDroplet,
	TbBandage,
} from "react-icons/tb";
import { MdOutlineMedicalServices } from "react-icons/md";

const ROUTE_FAMILY_ICONS = {
	Enteral: TbPill, // Pastillas, cápsulas, vía digestiva
	Parenteral: TbVaccine, // Todo lo inyectable (jeringa)
	Respiratoria: TbLungs, // Inhaladores, nebulizadores
	LocalGotas: TbDroplet, // Oftálmica, ótica (gotas)
	Topica: TbBandage, // Piel, parches
	Otra: MdOutlineMedicalServices, // Genérico para otras vías
};

const getRouteIcon = (routeName: string) => {
	const name = routeName?.toLowerCase() || "";

	// Agrupación Parenteral (Inyectables)
	if (
		name.includes("intra") ||
		name.includes("subcutánea") ||
		name.includes("epidural") ||
		name.includes("peridural") ||
		name.includes("retrobulbar") ||
		name.includes("peribulbar")
	) {
		return ROUTE_FAMILY_ICONS.Parenteral;
	}
	// Agrupación Enteral (Digestiva)
	if (
		name.includes("oral") ||
		name.includes("sublingual") ||
		name.includes("bucal") ||
		name.includes("gástrica") ||
		name.includes("yeyunostomía") ||
		name.includes("rectal")
	) {
		return ROUTE_FAMILY_ICONS.Enteral;
	}
	// Agrupación Respiratoria
	if (
		name.includes("inhal") ||
		name.includes("endotraqueal") ||
		name.includes("nasal")
	) {
		return ROUTE_FAMILY_ICONS.Respiratoria;
	}
	// Agrupación Gotas/Líquidos locales
	if (
		name.includes("oftálmica") ||
		name.includes("ótica") ||
		name.includes("conjuntival")
	) {
		return ROUTE_FAMILY_ICONS.LocalGotas;
	}
	// Agrupación Tópica/Superficial
	if (
		name.includes("tópica") ||
		name.includes("transdérmica") ||
		name.includes("vaginal") ||
		name.includes("uretral")
	) {
		return ROUTE_FAMILY_ICONS.Topica;
	}

	return ROUTE_FAMILY_ICONS.Otra;
};

// Esto esta sujeto a cambio
const ADMIN_ROUTE_GROUPS: Record<string, { icon: any }> = {
	// Enterales
	Oral: { icon: BeakerIcon },
	Sublingual: { icon: ChatBubbleBottomCenterTextIcon },

	// Parenterales
	Intravenosa: { icon: BoltIcon },
	Intramuscular: { icon: ArrowDownCircleIcon },

	// Respiratorias
	Inhalación: { icon: CloudIcon },
	Nasal: { icon: FaceSmileIcon },

	// Locales
	Tópica: { icon: HandRaisedIcon },
	Oftálmica: { icon: EyeIcon },
	Ótica: { icon: SpeakerWaveIcon },
};

const SPECIFIC_CATEGORY_COLORS: Record<
	string,
	"primary" | "success" | "error" | "warning" | "info"
> = {
	Cardiovasculares: "error", // Red for cardiovascular
	Analgésicos: "info",
	Antibióticos: "primary",
	Antipiréticos: "info",
	Antihistamínicos: "warning",
	Gastrointestinales: "warning",
	Dermatológicos: "light",
	"Suministros médicos": "default",
	Antidiabéticos: "success",
	Respiratorios: "info",
	"Neurológicos y Psiquiátricos": "warning",
	"Oftálmicos y Otológicos": "light",
	"Vitaminas y Suplementos": "success",
	"Salud Femenina": "primary",
	"Cuidado Infantil": "primary",
	"Cuidado Personal": "light",
	"Equipos Médicos": "default",
	"Ortopedia y Rehabilitación": "default",
};

const colors: ("primary" | "success" | "error" | "warning" | "info")[] = [
	"primary",
	"success",
	"error",
	"warning",
	"info",
];

const stringToHash = (str: string): number => {
	let hash = 0;
	if (str.length === 0) return hash;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0; // Convert to 32bit integer
	}
	return Math.abs(hash);
};

const getCategoryColor = (
	categoryName: string,
):
	| "primary"
	| "success"
	| "error"
	| "warning"
	| "info"
	| "light"
	| "default" => {
	if (!categoryName) {
		return "default";
	}
	if (SPECIFIC_CATEGORY_COLORS[categoryName]) {
		return SPECIFIC_CATEGORY_COLORS[categoryName];
	}
	const hash = stringToHash(categoryName);
	return colors[hash % colors.length];
};

const MedicineClasification = memo(({ row }: any) => {
	const intl = useIntl();

	const { category, brand, manufacturer, administration_route } =
		row.original || {};

	const categoryColor = getCategoryColor(category?.name);
	const administrationRoute =
		ADMIN_ROUTE_GROUPS[administration_route?.name] || null;
	const RouteIconComponent = administration_route?.name
		? getRouteIcon(administration_route.name)
		: null;

	return (
		<div className="flex flex-col gap-1 text-sm leading-tight">
			<div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
				{category?.name && (
					<span className="font-medium text-gray-900 dark:text-gray-100">
						<Badge variant={"solid"} color={categoryColor as any}>
							{category.name}
						</Badge>
					</span>
				)}
				{RouteIconComponent && (
					<RouteIconComponent
						className="size-4.5 text-gray-500 cursor-default dark:text-gray-100"
						data-tooltip-id="global-tooltip"
						data-tooltip-content={intl.formatMessage(
							{ id: "administration_route" },
							{ qoute: administration_route.name },
						)}
					/>
				)}
			</div>

			<div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 dark:text-gray-100">
				{brand?.name && <span>{brand.name}</span>}

				{brand?.name && manufacturer?.name && (
					<span className="text-gray-300">|</span>
				)}

				{manufacturer?.name && <span>{manufacturer.name}</span>}
			</div>
		</div>
	);
});

export default MedicineClasification;
