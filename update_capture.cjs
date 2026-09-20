const fs = require('fs');
const files = [
  'src/components/ui/table/CustomDrawers/AddNewCompany.tsx',
  'src/components/ui/table/CustomDrawers/AddNewInventoryPart.tsx',
  'src/components/ui/table/CustomDrawers/EditCompany.tsx',
  'src/components/ui/table/CustomDrawers/EditInventoryPart.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/accept="image\/\*"/g, 'accept="image/*"\n\t\t\t\t\t\t\tcapture="environment"');
  fs.writeFileSync(file, content, 'utf8');
}
