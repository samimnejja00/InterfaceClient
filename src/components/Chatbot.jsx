import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const CHATBOT_API_URL = process.env.REACT_APP_CHATBOT_URL || "http://127.0.0.1:5001/chat";

export default function Chatbot() {
  const { client } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour, je suis l'assistant de COMAR Assurance. Comment puis-je vous aider ?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(`web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const sendMessage = async () => {
    const messageToSend = input.trim();
    if (!messageToSend) return;

    const userMessage = { from: "user", text: messageToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          user_id: client?.id || null,
          client_id: client?.id || null,
          session_id: sessionIdRef.current,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.response || data?.message || "Une erreur est survenue.");
      }

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data?.response || "Je n'ai pas pu générer de réponse." },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: error?.message || "Erreur de connexion au serveur." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Toggle Button */}
      <button
        className="w-14 h-14 rounded-full bg-comar-royal text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center justify-center text-xl hover:scale-105 active:scale-95"
        onClick={toggleChat}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat Container */}
      <div
        className={`${
          isOpen ? 'flex opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-4'
        } flex-col w-[340px] sm:w-[380px] h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 absolute bottom-20 right-0`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-comar-navy to-comar-royal px-5 py-4 text-white font-semibold text-sm flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Assistant COMAR
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-comar-gray-bg/50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed animate-fade-in ${
                msg.from === "bot"
                  ? "bg-white text-comar-navy shadow-sm rounded-bl-md self-start mr-auto border border-gray-100"
                  : "bg-comar-royal text-white rounded-br-md self-end ml-auto"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-md bg-white shadow-sm border border-gray-100 flex items-center gap-1.5 mr-auto">
              <span className="w-2 h-2 rounded-full bg-comar-gray-text/50 animate-bounce-dot" style={{ animationDelay: '0s' }}></span>
              <span className="w-2 h-2 rounded-full bg-comar-gray-text/50 animate-bounce-dot" style={{ animationDelay: '0.16s' }}></span>
              <span className="w-2 h-2 rounded-full bg-comar-gray-text/50 animate-bounce-dot" style={{ animationDelay: '0.32s' }}></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="shrink-0 p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <input
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-comar-gray-bg text-sm text-comar-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-comar-royal/30 focus:border-comar-royal transition-all duration-200 disabled:opacity-50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Tapez votre message..."
            disabled={isLoading}
          />
          <button
            className="px-4 py-2.5 bg-comar-royal text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}