const fs = require('fs');
let text = fs.readFileSync('src/pages/MyRequests.jsx', 'utf8');

const thDemande = /<th style=\{\{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e2e8f0', fontWeight: '600', color: '#334155' \}\}>Demande<\/th>/;
const thNiveau = "<th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e2e8f0', fontWeight: '600', color: '#334155' }}>Niveau</th>";

text = text.replace(thDemande, thNiveau);

const tdDemande = /<td style=\{\{ padding: '1rem', borderBottom: '1px solid #f1f5f9', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' \}\}>[\s\S]*?<\/td>/;

// Function to replace tdDemande
const newTd = "<td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>\n" +
"                      <span style={{\n" +
"                        padding: '0.4rem 0.8rem',\n" +
"                        borderRadius: '20px',\n" +
"                        fontSize: '0.875rem',\n" +
"                        fontWeight: '600',\n" +
"                        backgroundColor: dossier.niveau === 'RELATION_CLIENT' ? '#f0fdf4' : dossier.niveau === 'PRESTATION' ? '#f0fdf4' : '#faf5ff',\n" +
"                        color: dossier.niveau === 'RELATION_CLIENT' ? '#166534' : dossier.niveau === 'PRESTATION' ? '#0f766e' : '#6b21a8',\n" +
"                      }}>\n" +
"                        {dossier.niveau === 'RELATION_CLIENT' ? 'Relation Client' : dossier.niveau === 'PRESTATION' ? 'Prestation' : dossier.niveau === 'FINANCE' ? 'Finance' : dossier.niveau}\n" +
"                      </span>\n" +
"                    </td>";

text = text.replace(tdDemande, newTd);
fs.writeFileSync('src/pages/MyRequests.jsx', text, 'utf8');
console.log("Replaced Demande column with Niveau");
