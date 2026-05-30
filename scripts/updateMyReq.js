const fs = require('fs');
let text = fs.readFileSync('src/pages/MyRequests.jsx', 'utf8');

const mapRegex = /function mapEtatToStatus\(etat\) \{[\s\S]*?\}/;
const newMap = "function mapEtatToStatus(etat) {\n" +
"  switch (etat) {\n" +
"    case 'EN_COURS': return 'En cours';\n" +
"    case 'EN_INSTANCE': return 'En instance';\n" +
"    case 'CLOTURE': return 'Clôturé';\n" +
"    default: return etat || 'Inconnu';\n" +
"  }\n" +
"}";
text = text.replace(mapRegex, newMap);

const colorRegex = /backgroundColor: dossier.etat === 'EN_COURS' \? '#dbeafe' : dossier.etat === 'TRAITE' \? '#dcfce7' : dossier.etat === 'REJETE' \? '#fee2e2' : '#fef3c7',[\s\S]*?color: dossier.etat === 'EN_COURS' \? '#1d4ed8' : dossier.etat === 'TRAITE' \? '#15803d' : dossier.etat === 'REJETE' \? '#b91c1c' : '#92400e',/;

const newColors = "backgroundColor: dossier.etat === 'EN_COURS' ? '#e0f2fe' : dossier.etat === 'CLOTURE' ? '#f3f4f6' : dossier.etat === 'EN_INSTANCE' ? '#fef3c7' : '#f3f4f6',\n" +
"                      color: dossier.etat === 'EN_COURS' ? '#0369a1' : dossier.etat === 'CLOTURE' ? '#4b5563' : dossier.etat === 'EN_INSTANCE' ? '#b45309' : '#4b5563',";

text = text.replace(colorRegex, newColors);
fs.writeFileSync('src/pages/MyRequests.jsx', text, 'utf8');
console.log("Replaced MyRequests");
