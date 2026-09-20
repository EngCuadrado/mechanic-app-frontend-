const fs = require('fs');

let content = fs.readFileSync('src/components/ui/table/CustomDrawers/AddNewVehicle.tsx', 'utf8');

// Add import
if (!content.includes('useIntl')) {
    content = content.replace('import { useState } from "react";', 'import { useState } from "react";\nimport { useIntl } from "react-intl";');
}

// Add intl hook
if (!content.includes('const intl = useIntl();')) {
    content = content.replace('export default function AddNewVehicle({ onClose }: { onClose?: () => void }) {', 'export default function AddNewVehicle({ onClose }: { onClose?: () => void }) {\n    const intl = useIntl();');
}

// Replace strings in JS logic
content = content.replace('"Por favor complete todos los campos obligatorios."', 'intl.formatMessage({ id: "vehicle.form.required_fields" })');
content = content.replace('"Vehculo agregado correctamente."', 'intl.formatMessage({ id: "vehicle.add.success" })'); // Handle possible  char if reading
content = content.replace('"Veh?culo agregado correctamente."', 'intl.formatMessage({ id: "vehicle.add.success" })'); // Another possible representation
content = content.replace('"Vehículo agregado correctamente."', 'intl.formatMessage({ id: "vehicle.add.success" })');

content = content.replace('"Error al agregar el vehculo."', 'intl.formatMessage({ id: "vehicle.add.error" })');
content = content.replace('"Error al agregar el veh?culo."', 'intl.formatMessage({ id: "vehicle.add.error" })');
content = content.replace('"Error al agregar el vehículo."', 'intl.formatMessage({ id: "vehicle.add.error" })');

content = content.replace('"Sin Marca"', 'intl.formatMessage({ id: "vehicle.form.no_brand" })');

// Replace JSX strings and placeholders
content = content.replace('<Label>Empresa *</Label>', '<Label>{intl.formatMessage({ id: "vehicle.form.company" })} *</Label>');
content = content.replace('placeholder="Seleccione Empresa"', 'placeholder={intl.formatMessage({ id: "vehicle.form.select_company" })}');

content = content.replace('<Label>Modelo *</Label>', '<Label>{intl.formatMessage({ id: "vehicle.form.model" })} *</Label>');
content = content.replace('placeholder="Seleccione Modelo"', 'placeholder={intl.formatMessage({ id: "vehicle.form.select_model" })}');

content = content.replace('<Label>Placa *</Label>', '<Label>{intl.formatMessage({ id: "vehicle.form.plate" })} *</Label>');
content = content.replace('placeholder="Ej. DEF-123"', 'placeholder={intl.formatMessage({ id: "vehicle.form.plate_placeholder" })}');

content = content.replace('<Label>VIN *</Label>', '<Label>{intl.formatMessage({ id: "vehicle.form.vin" })} *</Label>');
content = content.replace('placeholder="Ej. 1HGCM826..."', 'placeholder={intl.formatMessage({ id: "vehicle.form.vin_placeholder" })}');

content = content.replace('<Label>Chasis</Label>', '<Label>{intl.formatMessage({ id: "vehicle.form.chassis" })}</Label>');
content = content.replace('placeholder="Nmero de chasis"', 'placeholder={intl.formatMessage({ id: "vehicle.form.chassis_placeholder" })}');
content = content.replace('placeholder="N?mero de chasis"', 'placeholder={intl.formatMessage({ id: "vehicle.form.chassis_placeholder" })}');
content = content.replace('placeholder="Número de chasis"', 'placeholder={intl.formatMessage({ id: "vehicle.form.chassis_placeholder" })}');

// The file might contain 'Ao *' or 'A?o *' or 'Año *'
content = content.replace(/<Label>A[?ñ]o \*(<\/Label>)/, '<Label>{intl.formatMessage({ id: "vehicle.form.year" })} *');

content = content.replace('<Label>Kilometraje Actual *</Label>', '<Label>{intl.formatMessage({ id: "vehicle.form.current_milage" })} *</Label>');

content = content.replace(/<Label>Pr[?ó]ximo Mantenimiento \(Kilometraje\)<\/Label>/, '<Label>{intl.formatMessage({ id: "vehicle.form.next_maintenance_milage" })}</Label>');
content = content.replace(/<Label>Pr[?ó]ximo Mantenimiento \(Fecha\)<\/Label>/, '<Label>{intl.formatMessage({ id: "vehicle.form.next_maintenance_date" })}</Label>');

content = content.replace('<Label>Vencimiento de Seguro</Label>', '<Label>{intl.formatMessage({ id: "vehicle.form.insurance_expiration" })}</Label>');

content = content.replace(/<Label>Insp. Mec[?á]nica<\/Label>/, '<Label>{intl.formatMessage({ id: "vehicle.form.mechanical_inspection" })}</Label>');

content = content.replace('<Label>Emisiones</Label>', '<Label>{intl.formatMessage({ id: "vehicle.form.emissions_inspection" })}</Label>');

content = content.replace('Cancelar', '{intl.formatMessage({ id: "cancel" })}');
content = content.replace('"Guardando..."', '${intl.formatMessage({ id: "saving" })}...');

content = content.replace('"Guardar Vehculo"', 'intl.formatMessage({ id: "vehicle.form.save" })');
content = content.replace('"Guardar Veh?culo"', 'intl.formatMessage({ id: "vehicle.form.save" })');
content = content.replace('"Guardar Vehículo"', 'intl.formatMessage({ id: "vehicle.form.save" })');


fs.writeFileSync('src/components/ui/table/CustomDrawers/AddNewVehicle.tsx', content, 'utf8');
console.log('Component updated.');
