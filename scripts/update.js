const fs = require('fs');
let text = fs.readFileSync('src/pages/RequestDetails.jsx', 'utf8');

const regex = /const buildTrackingTimeline \= \(\) => \{[\s\S]*?if \(isFinished\) \{/;

const replacement = "const buildTrackingTimeline = () => {\n" +
"    const steps = [\n" +
"      { id: 'RELATION_CLIENT', title: 'Service Relation Client', desc: 'Réception et constitution du dossier' },\n" +
"      { id: 'PRESTATION', title: 'Service Prestation', desc: 'Analyse métier et calcul' },\n" +
"      { id: 'FINANCE', title: 'Service Finance', desc: 'Validation financière' },\n" +
"      { id: 'CLOTURE', title: 'Clôture et Paiement', desc: 'Règlement effectué' }\n" +
"    ];\n\n" +
"    let currentNiveauIndex = steps.findIndex(s => s.id === dossier.niveau);\n" +
"    if (currentNiveauIndex === -1) currentNiveauIndex = 0;\n" +
"    const isFinished = dossier.etat === 'CLOTURE' || dossier.etat === 'REJETE';\n\n" +
"    if (dossier.etat === 'CLOTURE') {\n" +
"        currentNiveauIndex = steps.length;\n" +
"    }\n\n" +
"    return steps.map((step, index) => {\n" +
"      let stepStatus = 'pending';\n" +
"      let dateText = 'À venir';\n" +
"      let timeText = '';\n\n" +
"      if (isFinished) {";

text = text.replace(regex, replacement);

const iconRegex = /const getStepIcon \= \(id\) => \{[\s\S]*?\};/;
const nextIcons = "const getStepIcon = (id) => {\n" +
"    switch(id) {\n" +
"      case 'RELATION_CLIENT': return '📦';\n" +
"      case 'PRESTATION': return '🔍';\n" +
"      case 'FINANCE': return '⚖️';\n" +
"      case 'CLOTURE': return '✅';\n" +
"      default: return '📄';\n" +
"    }\n  };";

text = text.replace(iconRegex, nextIcons);

fs.writeFileSync('src/pages/RequestDetails.jsx', text, 'utf8');
console.log("Replacement done");
