import React from "react";
import Badge from "../../badge/Badge";

interface Props {
    status?: string;
}

export const VehicleStatus: React.FC<Props> = ({ status }) => {
    let color: "primary" | "success" | "error" | "warning" | "info" | "light" | "dark" = "light";

    if (status === "DISPONIBLE") color = "success";
    else if (status === "ALQUILADO") color = "info";
    else if (status === "MANTENIMIENTO") color = "warning";
    else if (status === "FUERA_DE_SERVICIO") color = "error";

    return (
        <Badge variant="light" color={color} size="md">
            {status || "DESCONOCIDO"}
        </Badge>
    );
};
