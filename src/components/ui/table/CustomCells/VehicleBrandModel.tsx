import React from "react";
import Badge from "../../badge/Badge";

interface Props {
    brandName?: string;
    modelName?: string;
}

export const VehicleBrandModel: React.FC<Props> = ({ brandName, modelName }) => {
    return (
        <div className="flex flex-col gap-1 items-start">
            {brandName && (
                <Badge variant="light" color="dark" size="sm">
                    {brandName}
                </Badge>
            )}
            {modelName && (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {modelName}
                </span>
            )}
        </div>
    );
};
