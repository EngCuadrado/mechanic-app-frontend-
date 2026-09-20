import { useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "sonner";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Select from "../../../form/Select";
import { useMutation, useQuery } from "@apollo/client/react";
import { 
    UPDATE_VEHICLE_MUTATION, 
    GET_COMPANIES_QUERY, 
    GET_VEHICLE_MODELS_QUERY 
} from "../QuerysDefinitions";
import Button from "../../../ui/button/Button";
import Loading from "../../loading/Loading";

export default function EditVehicle({ row, onClose }: { row: any; onClose?: () => void }) {
    const intl = useIntl();
    // Queries
    const { data: companiesData, loading: loadingCompanies } = useQuery(GET_COMPANIES_QUERY());
    const { data: modelsData, loading: loadingModels } = useQuery(GET_VEHICLE_MODELS_QUERY(), {
        variables: { first: 1000 }
    });

    // Form state
    const [companyId, setCompanyId] = useState<string>(row.company?.companyId?.toString() || row.companyId?.toString() || "");
    const [modelId, setModelId] = useState<string>(row.model?.modelId?.toString() || row.modelId?.toString() || "");
    const [plate, setPlate] = useState(row.plate || "");
    const [vin, setVin] = useState(row.vin || "");
    const [chassisNumber, setChassisNumber] = useState(row.chassisNumber || "");
    const [year, setYear] = useState<number>(row.year || new Date().getFullYear());
    const [currentMilage, setCurrentMilage] = useState<number>(row.currentMilage || 0);
    const [nextMaintenanceDate, setNextMaintenanceDate] = useState(row.nextMaintenanceDate || "");
    const [nextMaintenanceMilage, setNextMaintenanceMilage] = useState<number>(row.nextMaintenanceMilage || 0);
    const [insuranceExpirationDate, setInsuranceExpirationDate] = useState(row.insuranceExpirationDate || "");
    const [mechanicalInspectionExpiration, setMechanicalInspectionExpiration] = useState(row.mechanicalInspectionExpiration || "");
    const [emissionsInspectionExpiration, setEmissionsInspectionExpiration] = useState(row.emissionsInspectionExpiration || "");
    const [status, setStatus] = useState<string>(row.status || "DISPONIBLE");

    const [updateVehicle, { loading: saving }] = useMutation(UPDATE_VEHICLE_MUTATION, {
        refetchQueries: ["GetVehicles"],
    });

    const handleSubmit = async () => {
        if (!companyId || !modelId || !plate || !vin || !chassisNumber || !year || currentMilage < 0 || !nextMaintenanceDate || nextMaintenanceMilage < 0 || !insuranceExpirationDate || !mechanicalInspectionExpiration || !emissionsInspectionExpiration) {
            toast.error(intl.formatMessage({ id: "vehicle.form.required_fields" }));
            return;
        }

        try {
            await updateVehicle({
                variables: {
                    vehicleId: parseInt(row.vehicleId),
                    companyId: parseInt(companyId),
                    modelId: parseInt(modelId),
                    plate: plate.toUpperCase(),
                    vin: vin.toUpperCase(),
                    chassisNumber: chassisNumber.toUpperCase(),
                    year: parseInt(year.toString()),
                    currentMilage: parseInt(currentMilage.toString()),
                    nextMaintenanceDate: nextMaintenanceDate,
                    nextMaintenanceMilage: parseInt(nextMaintenanceMilage.toString()),
                    insuranceExpirationDate: insuranceExpirationDate,
                    mechanicalInspectionExpiration: mechanicalInspectionExpiration,
                    emissionsInspectionExpiration: emissionsInspectionExpiration,
                    status,
                }
            });
            toast.success(intl.formatMessage({ id: "vehicle.edit.success" }));
            if (onClose) onClose();
        } catch (error: any) {
            toast.error(error.message || "Error al agregar el vehículo.");
        }
    };

    if (loadingCompanies || loadingModels) {
        return <div className="p-10 flex justify-center"><Loading size="lg" /></div>;
    }

    const companyOptions = companiesData?.companies?.nodes?.map((c: any) => ({
        value: c.companyId.toString(),
        label: c.name
    })) || [];

    const modelOptions = modelsData?.vehicleModels?.nodes?.map((m: any) => ({
        value: m.modelId.toString(),
        label: `${m.brand?.brandName || intl.formatMessage({ id: "vehicle.form.no_brand" })} - ${m.modelName}`
    })) || [];

    return (
        <div className="flex flex-col gap-5 p-1 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div><Label>{intl.formatMessage({ id: "vehicle.form.status" })} *</Label><Select options={[{ value: "MANTENIMIENTO", label: "MANTENIMIENTO" },{ value: "DISPONIBLE", label: "DISPONIBLE" },{ value: "ALQUILADO", label: "ALQUILADO" },{ value: "FUERA_DE_SERVICIO", label: "FUERA_DE_SERVICIO" }]} value={status} onChange={setStatus} placeholder="Seleccione Estado" /></div>
                <div>
                    <Label>{intl.formatMessage({ id: "vehicle.form.company" })} *</Label>
                    <Select
                        options={companyOptions}
                        value={companyId}
                        onChange={setCompanyId}
                        placeholder={intl.formatMessage({ id: "vehicle.form.select_company" })}
                    />
                </div>
                <div>
                    <Label>{intl.formatMessage({ id: "vehicle.form.model" })} *</Label>
                    <Select
                        options={modelOptions}
                        value={modelId}
                        onChange={setModelId}
                        placeholder={intl.formatMessage({ id: "vehicle.form.select_model" })}
                    />
                </div>

                <div>
                    <Label>{intl.formatMessage({ id: "vehicle.form.plate" })} *</Label>
                    <Input
                        type="text"
                        value={plate}
                        onChange={(e) => setPlate(e.target.value.toUpperCase())}
                        placeholder={intl.formatMessage({ id: "vehicle.form.plate_placeholder" })}
                    />
                </div>
                <div>
                    <Label>{intl.formatMessage({ id: "vehicle.form.vin" })} *</Label>
                    <Input
                        type="text"
                        value={vin}
                        onChange={(e) => setVin(e.target.value.toUpperCase())}
                        placeholder={intl.formatMessage({ id: "vehicle.form.vin_placeholder" })}
                    />
                </div>

                <div>
                    <Label>{intl.formatMessage({ id: "vehicle.form.chassis" })}</Label>
                    <Input
                        type="text"
                        value={chassisNumber}
                        onChange={(e) => setChassisNumber(e.target.value.toUpperCase())}
                        placeholder="Número de chasis"
                    />
                </div>
                <div>
                    <Label>Año *</Label>
                    <Input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value) || 0)}
                    />
                </div>

                <div>
                    <Label>{intl.formatMessage({ id: "vehicle.form.current_milage" })} *</Label>
                    <Input
                        type="number"
                        value={currentMilage}
                        onChange={(e) => setCurrentMilage(parseInt(e.target.value) || 0)}
                        min="0"
                    />
                </div>
                <div>
                    <Label>Próximo Mantenimiento (Kilometraje)</Label>
                    <Input
                        type="number"
                        value={nextMaintenanceMilage}
                        onChange={(e) => setNextMaintenanceMilage(parseInt(e.target.value) || 0)}
                        min="0"
                    />
                </div>

                <div>
                    <Label>Próximo Mantenimiento (Fecha)</Label>
                    <Input
                        type="date"
                        value={nextMaintenanceDate}
                        onChange={(e) => setNextMaintenanceDate(e.target.value)}
                    />
                </div>
                <div>
                    <Label>{intl.formatMessage({ id: "vehicle.form.insurance_expiration" })}</Label>
                    <Input
                        type="date"
                        value={insuranceExpirationDate}
                        onChange={(e) => setInsuranceExpirationDate(e.target.value)}
                    />
                </div>

                <div>
                    <Label>Insp. Mecánica</Label>
                    <Input
                        type="date"
                        value={mechanicalInspectionExpiration}
                        onChange={(e) => setMechanicalInspectionExpiration(e.target.value)}
                    />
                </div>
                <div>
                    <Label>{intl.formatMessage({ id: "vehicle.form.emissions_inspection" })}</Label>
                    <Input
                        type="date"
                        value={emissionsInspectionExpiration}
                        onChange={(e) => setEmissionsInspectionExpiration(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
                <Button size="sm" variant="outline" onClick={onClose} disabled={saving}>
                    {intl.formatMessage({ id: "cancel" })}
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={saving}>
                    {saving ? `${intl.formatMessage({ id: "saving" })}...` : intl.formatMessage({ id: "vehicle.form.update" })}
                </Button>
            </div>
        </div>
    );
}











