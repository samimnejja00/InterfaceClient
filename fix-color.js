const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.jsx', 'utf8');

code = code.replace(
  /<p style={{ margin: 0, fontSize: "14px", whiteSpace: "pre-wrap" }}>{msg\.text}<\/p>/, 
  '<p style={{ margin: 0, fontSize: "14px", whiteSpace: "pre-wrap", color: msg.from === "bot" ? "#333333" : "#ffffff" }}>{msg.text}</p>'
);

fs.writeFileSync('src/components/Chatbot.jsx', code, 'utf8');
console.log('Fixed message color');