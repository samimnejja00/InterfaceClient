const fs = require('fs');
let text = fs.readFileSync('src/pages/RequestDetails.jsx', 'utf8');

const mapRegex = /function mapEtatToStatus\(etat\) \{[\s\S]*?function RequestDetails\(\)/;
const newMap = "function mapEtatToStatus(etat) {\n" +
"  switch (etat) {\n" +
"    case 'EN_COURS': return 'En cours';\n" +
"    case 'EN_INSTANCE': return 'En instance';\n" +
"    case 'CLOTURE': return 'Clôturé';\n" +
"    default: return etat || 'Inconnu';\n" +
"  }\n" +
"}\n\n" +
"function RequestDetails()";

text = text.replace(mapRegex, newMap);
fs.writeFileSync('src/pages/RequestDetails.jsx', text, 'utf8');
console.log("Replaced mapEtatToStatus");
