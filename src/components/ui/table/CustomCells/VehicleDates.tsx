import React from "react";
import dayjs from "dayjs";
import { ShieldCheckIcon, WrenchIcon, CloudIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";

interface Props {
    insuranceDate?: string;
    mechanicalDate?: string;
    emissionsDate?: string;
    maintenanceDate?: string;
}

type ColorState = "green" | "yellow" | "red" | "gray";

const getDateColorState = (dateStr?: string): ColorState => {
    if (!dateStr) return "gray";
    const days = dayjs(dateStr).diff(dayjs().startOf('day'), "day");
    
    if (days < 7) return "red"; // Ya pas� o vence en menos de 7 d�as
    if (days <= 30) return "yellow"; // Vence en los pr�ximos 30 d�as
    return "green"; // Vence en m�s de 30 d�as
};

const getStylesByColor = (color: ColorState) => {
    switch (color) {
        case "green":
            return "bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400";
        case "yellow":
            return "bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400";
        case "red":
            return "bg-error-100 text-error-600 dark:bg-error-500/20 dark:text-error-400";
        case "gray":
        default:
            return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
    }
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Sin registro";
    return dayjs(dateStr).format("DD/MM/YYYY");
};

export const VehicleDates: React.FC<Props> = ({ insuranceDate, mechanicalDate, emissionsDate, maintenanceDate }) => {
    
    const IconWrapper = ({ icon: Icon, date, label }: { icon: any, date?: string, label: string }) => {
        const colorState = getDateColorState(date);
        const styles = getStylesByColor(colorState);
        
        return (
            <div 
                className={`flex items-center justify-center w-8 h-8 rounded-md ${styles}`}
                data-tooltip-id="vehicle-dates-tooltip" 
                data-tooltip-content={`${label}: ${formatDate(date)}`}
            >
                <Icon className="w-5 h-5" />
            </div>
        );
    };

    return (
        <div className="flex items-center gap-2">
            <IconWrapper icon={ShieldCheckIcon} date={insuranceDate} label="Seguro" />
            <IconWrapper icon={WrenchIcon} date={mechanicalDate} label="Insp. Mecánica" />
            <IconWrapper icon={CloudIcon} date={emissionsDate} label="Emisiones" />
            <IconWrapper icon={CalendarDaysIcon} date={maintenanceDate} label="Mantenimiento" />
            
            <Tooltip id="vehicle-dates-tooltip" className="z-50" />
        </div>
    );
};
