const fs = require('fs');
const path = 'src/lang/es.json';
let raw = fs.readFileSync(path, 'utf8');
if (raw.charCodeAt(0) === 0xFEFF) {
  raw = raw.slice(1);
}
let data = JSON.parse(raw);

const newKeys = {
  "vehicle.edit.success": "Vehículo actualizado correctamente.",
  "vehicle.edit.error": "Error al actualizar el vehículo.",
  "vehicle.form.update": "Actualizar Vehículo",
  "vehicle.form.status": "Estado"
};

let added = 0;
for (const [key, value] of Object.entries(newKeys)) {
  if (!data[key]) {
    data[key] = value;
    added++;
  }
}

const sortedData = {};
Object.keys(data).sort().forEach(k => {
  sortedData[k] = data[k];
});

fs.writeFileSync(path, JSON.stringify(sortedData, null, 4), 'utf8');
console.log('Added ' + added + ' keys.');
