const fs = require('fs');
const path = 'src/lang/es.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));

const newKeys = {
  "vehicle.form.required_fields": "Por favor complete todos los campos obligatorios.",
  "vehicle.add.success": "Vehículo agregado correctamente.",
  "vehicle.add.error": "Error al agregar el vehículo.",
  "vehicle.form.company": "Empresa",
  "vehicle.form.select_company": "Seleccione Empresa",
  "vehicle.form.model": "Modelo",
  "vehicle.form.select_model": "Seleccione Modelo",
  "vehicle.form.plate": "Placa",
  "vehicle.form.plate_placeholder": "Ej. DEF-123",
  "vehicle.form.vin": "VIN",
  "vehicle.form.vin_placeholder": "Ej. 1HGCM826...",
  "vehicle.form.chassis": "Chasis",
  "vehicle.form.chassis_placeholder": "Número de chasis",
  "vehicle.form.year": "Año",
  "vehicle.form.current_milage": "Kilometraje Actual",
  "vehicle.form.next_maintenance_date": "Próximo Mantenimiento (Fecha)",
  "vehicle.form.next_maintenance_milage": "Próximo Mantenimiento (Kilometraje)",
  "vehicle.form.insurance_expiration": "Vencimiento de Seguro",
  "vehicle.form.mechanical_inspection": "Insp. Mecánica",
  "vehicle.form.emissions_inspection": "Emisiones",
  "vehicle.form.save": "Guardar Vehículo",
  "vehicle.form.no_brand": "Sin Marca"
};

let added = 0;
for (const [key, value] of Object.entries(newKeys)) {
  if (!data[key]) {
    data[key] = value;
    added++;
  }
}

// sort keys alphabetically
const sortedData = {};
Object.keys(data).sort().forEach(k => {
  sortedData[k] = data[k];
});

fs.writeFileSync(path, JSON.stringify(sortedData, null, 4));
console.log('Added ' + added + ' keys.');
