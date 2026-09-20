const fs = require('fs');
let content = fs.readFileSync('src/components/ui/table/CustomDrawers/EditVehicle.tsx', 'utf8');

content = content.replace(
    'const [companyId, setCompanyId] = useState<string>("");',
    'const [companyId, setCompanyId] = useState<string>(row.company?.companyId?.toString() || row.companyId?.toString() || "");'
);
content = content.replace(
    'const [modelId, setModelId] = useState<string>("");',
    'const [modelId, setModelId] = useState<string>(row.model?.modelId?.toString() || row.modelId?.toString() || "");'
);
content = content.replace(
    'const [plate, setPlate] = useState("");',
    'const [plate, setPlate] = useState(row.plate || "");'
);
content = content.replace(
    'const [vin, setVin] = useState("");',
    'const [vin, setVin] = useState(row.vin || "");'
);
content = content.replace(
    'const [chassisNumber, setChassisNumber] = useState("");',
    'const [chassisNumber, setChassisNumber] = useState(row.chassisNumber || "");'
);
content = content.replace(
    'const [year, setYear] = useState<number>(new Date().getFullYear());',
    'const [year, setYear] = useState<number>(row.year || new Date().getFullYear());'
);
content = content.replace(
    'const [currentMilage, setCurrentMilage] = useState<number>(0);',
    'const [currentMilage, setCurrentMilage] = useState<number>(row.currentMilage || 0);'
);
content = content.replace(
    'const [nextMaintenanceDate, setNextMaintenanceDate] = useState("");',
    'const [nextMaintenanceDate, setNextMaintenanceDate] = useState(row.nextMaintenanceDate || "");'
);
content = content.replace(
    'const [nextMaintenanceMilage, setNextMaintenanceMilage] = useState<number>(0);',
    'const [nextMaintenanceMilage, setNextMaintenanceMilage] = useState<number>(row.nextMaintenanceMilage || 0);\n    const [insuranceExpirationDate, setInsuranceExpirationDate] = useState(row.insuranceExpirationDate || "");\n    const [mechanicalInspectionExpiration, setMechanicalInspectionExpiration] = useState(row.mechanicalInspectionExpiration || "");\n    const [emissionsInspectionExpiration, setEmissionsInspectionExpiration] = useState(row.emissionsInspectionExpiration || "");\n    const [status, setStatus] = useState<string>(row.status || "DISPONIBLE");'
);

// We need to remove the duplicate state lines since we injected them
content = content.replace('    const [insuranceExpirationDate, setInsuranceExpirationDate] = useState("");\n', '');
content = content.replace('    const [mechanicalInspectionExpiration, setMechanicalInspectionExpiration] = useState("");\n', '');
content = content.replace('    const [emissionsInspectionExpiration, setEmissionsInspectionExpiration] = useState("");\n', '');

// Add vehicleId and status to mutation
content = content.replace(
    'companyId: parseInt(companyId),',
    'vehicleId: parseInt(row.vehicleId),\n                    companyId: parseInt(companyId),'
);
content = content.replace(
    'emissionsInspectionExpiration: emissionsInspectionExpiration,',
    'emissionsInspectionExpiration: emissionsInspectionExpiration,\n                    status,'
);

// Add Status Select to the UI
const statusSelectHtml = '<div>\\n<Label>{intl.formatMessage({ id: "vehicle.form.status" })} *</Label>\\n<Select options={[{ value: "DISPONIBLE", label: "DISPONIBLE" },{ value: "MANTENIMIENTO", label: "MANTENIMIENTO" }]} value={status} onChange={setStatus} placeholder="Seleccione Estado" />\\n</div>\\n';
content = content.replace(
    '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">\n' + statusSelectHtml
);

// We also need UPDATE_VEHICLE_MUTATION in the imports
content = content.replace(
    'ADD_VEHICLE_MUTATION,',
    'UPDATE_VEHICLE_MUTATION,'
);

fs.writeFileSync('src/components/ui/table/CustomDrawers/EditVehicle.tsx', content, 'utf8');
