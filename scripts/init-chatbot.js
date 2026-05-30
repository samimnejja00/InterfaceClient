const fs = require('fs');

const code = `import React, { useState } from 'react';
import '../styles/App.css'; 

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div 
        onClick={toggleChat}
        style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          backgroundColor: '#005baa', 
          color: 'white', 
          width: '60px',
          height: '60px',
          borderRadius: '50%', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          zIndex: 1000,
          fontSize: '24px'
        }}
      >
        💬
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '320px',
          height: '420px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: '#005baa',
            color: 'white',
            padding: '15px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Assistant Virtuel</span>
            <button 
              onClick={toggleChat} 
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
            >
              ✖
            </button>
          </div>
          <div style={{ flex: 1, padding: '15px', backgroundColor: '#f5f7fa', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ alignSelf: 'flex-start', backgroundColor: '#e2e8f0', padding: '10px', borderRadius: '10px', maxWidth: '80%' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>Bonjour ! Comment puis-je vous aider avec vos démarches aujourd'hui ?</p>
            </div>
          </div>
          <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px', backgroundColor: '#fff' }}>
             <input type="text" placeholder="Écrivez votre message..." style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' }} />
             <button style={{ backgroundColor: '#005baa', color: 'white', border: 'none', borderRadius: '4px', padding: '0 15px', cursor: 'pointer', fontWeight: 'bold' }}>Envoyer</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
`;

fs.writeFileSync('src/components/Chatbot.jsx', code, 'utf-8');
console.log('Chatbot.jsx initialized');
