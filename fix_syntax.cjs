const fs = require('fs');
let content = fs.readFileSync('src/components/ui/table/QuerysDefinitions.tsx', 'utf8');

content = content.replace('export const UPDATE_VEHICLE_MUTATION = gql\\', 'export const UPDATE_VEHICLE_MUTATION = gql');
content = content.replace('}\\n\\;', '}\\n;');

fs.writeFileSync('src/components/ui/table/QuerysDefinitions.tsx', content, 'utf8');
