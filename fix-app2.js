const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');
code = code.replace(/import RCDashboard from '\.\/pages\/RCDashboard';\n?/, '');
code = code.replace(/<Route\s+path="\/rc-dashboard"[\s\S]*?<\/ProtectedRoute>\s*}\s*\/>\n?/s, '');
fs.writeFileSync('src/App.jsx', code, 'utf-8');
console.log('App.jsx fixed');
