const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

if (!code.includes('import Chatbot')) {
  code = code.replace(/import '\.\/styles\/App\.css';/, 
    "import Chatbot from './components/Chatbot';\nimport './styles/App.css';");
}

code = code.replace(/<\/Routes>\s*<\/Router>/, `</Routes>
      {isAuthenticated && <Chatbot />}
    </Router>`);

fs.writeFileSync('src/App.jsx', code, 'utf-8');
console.log('App.jsx fixed safely');
