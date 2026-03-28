import { useState, useEffect, useRef } from "react";
import "./Chatbot.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour, je suis l'assistant de COMAR Assurance. Comment puis-je vous aider ?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbotWrapper">
      <button className="chatToggleBtn" onClick={toggleChat}>
        {isOpen ? "✕" : "💬"}
      </button>

      <div className={`chatbotContainer ${isOpen ? 'open' : 'closed'}`}>
        <div className="chatHeader">
          Assistant COMAR
        </div>

        <div className="chatMessages">
          {messages.map((msg, i) => (
            <div key={i} className={`msgBubble ${msg.from === "bot" ? "botMsg" : "userMsg"}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="msgBubble botMsg typingIndicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatInputArea">
          <input
            className="chatInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Tapez votre message..."
            disabled={isLoading}
          />
          <button className="chatButton" onClick={sendMessage} disabled={isLoading || !input.trim()}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}