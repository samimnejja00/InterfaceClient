const fs = require("fs");
const path = "src/components/Chatbot.jsx";
let content = `import React, { useState } from "react";
import "../styles/App.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour ! Comment puis-je vous aider avec vos démarches aujourd'hui ?" }
  ]);
  const [input, setInput] = useState("");

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { from: "bot", text: data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { from: "bot", text: "Erreur de connexion au serveur." }]);
    }
  };

  return (
    <>
      <div
        onClick={toggleChat}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#005baa",
          color: "white",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          zIndex: 1000,
          fontSize: "24px"
        }}
      >
        💬
      </div>

      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: "90px",
          right: "20px",
          width: "350px",
          height: "450px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          <div style={{
            backgroundColor: "#005baa",
            color: "white",
            padding: "15px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>Assistant Virtuel</span>
            <button
              onClick={toggleChat}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "18px" }}
            >
              ✖
            </button>
          </div>
          
          <div style={{ flex: 1, padding: "15px", backgroundColor: "#f5f7fa", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>      
            {messages.map((msg, i) => (
              <div 
                key={i} 
                style={{ 
                  alignSelf: msg.from === "bot" ? "flex-start" : "flex-end", 
                  backgroundColor: msg.from === "bot" ? "#e2e8f0" : "#005baa", 
                  color: msg.from === "bot" ? "black" : "white",
                  padding: "10px", 
                  borderRadius: "10px", 
                  maxWidth: "80%" 
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", whiteSpace: "pre-wrap" }}>{msg.text}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: "15px", borderTop: "1px solid #eee", display: "flex", gap: "10px", backgroundColor: "#fff" }}>
             <input 
                type="text" 
                placeholder="Écrivez votre message..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={{ flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "4px", outline: "none" }} 
             />
             <button 
                onClick={sendMessage}
                style={{ backgroundColor: "#005baa", color: "white", border: "none", borderRadius: "4px", padding: "0 15px", cursor: "pointer", fontWeight: "bold" }}
             >
                Envoyer
             </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
`;
fs.writeFileSync(path, content, "utf8");
console.log("Chatbot functionality fixed");