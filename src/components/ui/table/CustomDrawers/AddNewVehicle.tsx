import { useState } from "react";
import { toast } from "sonner";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Select from "../../../form/Select";
import { useMutation, useQuery } from "@apollo/client/react";
import { 
    ADD_VEHICLE_MUTATION, 
    GET_COMPANIES_QUERY, 
    GET_VEHICLE_MODELS_QUERY 
} from "../QuerysDefinitions";
import Button from "../../../ui/button/Button";
import Loading from "../../loading/Loading";

export default function AddNewVehicle({ onClose }: { onClose?: () => void }) {
    // Queries
    const { data: companiesData, loading: loadingCompanies } = useQuery(GET_COMPANIES_QUERY());
    const { data: modelsData, loading: loadingModels } = useQuery(GET_VEHICLE_MODELS_QUERY(), {
        variables: { first: 1000 }
    });

    // Form state
    const [companyId, setCompanyId] = useState<string>("");
    const [modelId, setModelId] = useState<string>("");
    const [plate, setPlate] = useState("");
    const [vin, setVin] = useState("");
    const [chassisNumber, setChassisNumber] = useState("");
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [currentMilage, setCurrentMilage] = useState<number>(0);
    const [nextMaintenanceDate, setNextMaintenanceDate] = useState("");
    const [nextMaintenanceMilage, setNextMaintenanceMilage] = useState<number>(0);
    const [insuranceExpirationDate, setInsuranceExpirationDate] = useState("");
    const [mechanicalInspectionExpiration, setMechanicalInspectionExpiration] = useState("");
    const [emissionsInspectionExpiration, setEmissionsInspectionExpiration] = useState("");

    const [addVehicle, { loading: saving }] = useMutation(ADD_VEHICLE_MUTATION, {
        refetchQueries: ["GetVehicles"],
    });

    const handleSubmit = async () => {
        if (!companyId || !modelId || !plate || !vin || !chassisNumber || !year || currentMilage < 0 || !nextMaintenanceDate || nextMaintenanceMilage < 0 || !insuranceExpirationDate || !mechanicalInspectionExpiration || !emissionsInspectionExpiration) {
            toast.error("Por favor complete todos los campos obligatorios.");
            return;
        }

        try {
            await addVehicle({
                variables: {
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
                }
            });
            toast.success("Veh�culo agregado correctamente.");
            if (onClose) onClose();
        } catch (error: any) {
            toast.error(error.message || "Error al agregar el veh�culo.");
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
        label: `${m.brand?.brandName || "Sin Marca"} - ${m.modelName}`
    })) || [];

    return (
        <div className="flex flex-col gap-5 p-1 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Empresa *</Label>
                    <Select
                        options={companyOptions}
                        value={companyId}
                        onChange={setCompanyId}
                        placeholder="Seleccione Empresa"
                    />
                </div>
                <div>
                    <Label>Modelo *</Label>
                    <Select
                        options={modelOptions}
                        value={modelId}
                        onChange={setModelId}
                        placeholder="Seleccione Modelo"
                    />
                </div>

                <div>
                    <Label>Placa *</Label>
                    <Input
                        type="text"
                        value={plate}
                        onChange={(e) => setPlate(e.target.value.toUpperCase())}
                        placeholder="Ej. DEF-123"
                    />
                </div>
                <div>
                    <Label>VIN *</Label>
                    <Input
                        type="text"
                        value={vin}
                        onChange={(e) => setVin(e.target.value.toUpperCase())}
                        placeholder="Ej. 1HGCM826..."
                    />
                </div>

                <div>
                    <Label>Chasis</Label>
                    <Input
                        type="text"
                        value={chassisNumber}
                        onChange={(e) => setChassisNumber(e.target.value.toUpperCase())}
                        placeholder="N�mero de chasis"
                    />
                </div>
                <div>
                    <Label>A�o *</Label>
                    <Input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value) || 0)}
                    />
                </div>

                <div>
                    <Label>Kilometraje Actual *</Label>
                    <Input
                        type="number"
                        value={currentMilage}
                        onChange={(e) => setCurrentMilage(parseInt(e.target.value) || 0)}
                        min="0"
                    />
                </div>
                <div>
                    <Label>Pr�ximo Mantenimiento (Kilometraje)</Label>
                    <Input
                        type="number"
                        value={nextMaintenanceMilage}
                        onChange={(e) => setNextMaintenanceMilage(parseInt(e.target.value) || 0)}
                        min="0"
                    />
                </div>

                <div>
                    <Label>Pr�ximo Mantenimiento (Fecha)</Label>
                    <Input
                        type="date"
                        value={nextMaintenanceDate}
                        onChange={(e) => setNextMaintenanceDate(e.target.value)}
                    />
                </div>
                <div>
                    <Label>Vencimiento de Seguro</Label>
                    <Input
                        type="date"
                        value={insuranceExpirationDate}
                        onChange={(e) => setInsuranceExpirationDate(e.target.value)}
                    />
                </div>

                <div>
                    <Label>Insp. Mec�nica</Label>
                    <Input
                        type="date"
                        value={mechanicalInspectionExpiration}
                        onChange={(e) => setMechanicalInspectionExpiration(e.target.value)}
                    />
                </div>
                <div>
                    <Label>Emisiones</Label>
                    <Input
                        type="date"
                        value={emissionsInspectionExpiration}
                        onChange={(e) => setEmissionsInspectionExpiration(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
                <Button size="sm" variant="outline" onClick={onClose} disabled={saving}>
                    Cancelar
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={saving}>
                    {saving ? "Guardando..." : "Guardar Veh�culo"}
                </Button>
            </div>
        </div>
    );
}



