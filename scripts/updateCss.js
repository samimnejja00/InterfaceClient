const fs = require('fs');
let text = fs.readFileSync('src/styles/RequestDetails.css', 'utf8');

text += "\n.status-badge.status-en_cours {\n  background-color: #e0f2fe;\n  color: #0369a1;\n}\n" +
".status-badge.status-en_instance {\n  background-color: #fef3c7;\n  color: #b45309;\n}\n" +
".status-badge.status-cloture {\n  background-color: #f3f4f6;\n  color: #4b5563;\n}\n";

fs.writeFileSync('src/styles/RequestDetails.css', text, 'utf8');
console.log("Updated CSS");
