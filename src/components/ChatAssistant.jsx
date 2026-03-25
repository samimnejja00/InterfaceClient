import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import useFormAssistant from '../hooks/useFormAssistant';
import '../styles/ChatAssistant.css';

const ChatAssistant = ({ formData, onFormUpdate }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour! 👋 Je suis l'assistante de PrestaTrack. Je vais vous guider pour remplir votre demande de prestation d'assurance. Commençons!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { getNextQuestion, processAnswer, isFormComplete } = useFormAssistant(formData, onFormUpdate);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Process answer and get response
    const response = await processAnswer(input);
    
    setTimeout(() => {
      const assistantMessage = {
        id: messages.length + 2,
        text: response.message,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="chat-assistant">
      <div className="chat-header">
        <h3>Assistante PrestaTrack</h3>
        <span className="chat-status">
          {isFormComplete() ? '✅ Complet' : `📋 ${Math.round((Object.values(formData).filter(v => v).length / 4) * 100)}%`}
        </span>
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isUser={message.isUser}
          />
        ))}
        {isLoading && (
          <div className="chat-message assistant-message loading">
            <div className="message-avatar">🤖</div>
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre réponse..."
          disabled={isLoading}
          className="chat-input"
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="chat-send-btn"
        >
          ➤
        </button>
      </form>
    </div>
  );
};

export default ChatAssistant;
