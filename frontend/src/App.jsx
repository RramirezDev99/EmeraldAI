import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // <<-- Importa los estilos del CSS

// NOTA: Asume que 'assets' está DENTRO de 'src', y el nombre es 'EmraldAI.png'
import EmeraldLogo from "./assets/EmraldAI.png";

// RUTA CORREGIDA: Usamos la ruta relativa para Vercel
const API_URL = "/api/chat";

// Componente Loader con el Logo giratorio (EmeraldAI.png)
const ChatLoader = ({ logoSrc }) => (
    <div className="message bot message-loader">
        <div className="loader-container">
            <div className="spinner-border"></div>
            <img src={logoSrc} alt="Loading" className="loader-logo" />
        </div>
        <p className="typing-indicator">IA: Escribiendo...</p>
    </div>
);

// Componente para el encabezado fijo (cuando la conversación ha iniciado)
const ChatHeaderFixed = ({ logoSrc }) => (
    <div className="chat-header-fixed">
        <img 
            src={logoSrc}
            alt="EmeraldAI Logo"
            className="header-logo-small"
        />
        <h1 className="title-small">EmeraldAI</h1>
    </div>
);

function App() {
  const initialMessage = { text: "¡Hola! Pregúntale a EmeraldAI.", sender: "bot" };
  
  // Usamos el mensaje inicial en el estado para controlar la pantalla de bienvenida
  const [messages, setMessages] = useState([initialMessage]); 
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef(null);

  // Scroll automático al final
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const userMessageText = input.trim();
    if (!userMessageText) return;

    const userMessage = { text: userMessageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // LLAMADA CORREGIDA: Usa la ruta relativa API_URL
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText }),
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
          throw new Error(data.error || "Error en la respuesta del servidor.");
      }

      const botMessage = { text: data.text, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error en la comunicación:", error);
      setMessages(prev => [...prev, { 
        text: `⚠️ Error: ${error.message || 'No se pudo conectar.'} (Revisa la consola)`, 
        sender: "system" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // La pantalla inicial se mantiene si solo tiene el mensaje de bienvenida
  const isInitialScreen = messages.length === 1 && messages[0].sender === 'bot'; 

  return (
    <div className="app-container">
        
        {/* Header fijo - solo visible cuando NO es pantalla inicial */}
        {!isInitialScreen && <ChatHeaderFixed logoSrc={EmeraldLogo} />}
        
        {/* Área de contenido */}
        <div className="content-area">
            {isInitialScreen ? (
                /* PANTALLA INICIAL CENTRADA */
                <div className="initial-screen">
                    <div className="centered-header">
                        <img 
                            src={EmeraldLogo}
                            alt="EmeraldAI Logo"
                            className="header-logo-large"
                        />
                        <h1 className="main-title">EmeraldAI</h1>
                    </div>
                </div>
            ) : (
                /* ÁREA DE CHAT CON MENSAJES */
                <div className="chat-area">
                    <div className="chat-messages" ref={chatWindowRef}>
                        {messages.map((msg, index) => {
                            // Saltar el mensaje inicial de bienvenida cuando hay más mensajes
                            if (index === 0 && msg.sender === 'bot' && messages.length > 1) {
                                return null;
                            }
                            
                            return (
                                <div 
                                    key={index} 
                                    className={`message-row message-fade-in ${msg.sender}`}
                                    style={{animationDelay: `${index * 50}ms`}} 
                                >
                                    {/* AVATAR DEL BOT */}
                                    {msg.sender === 'bot' && (
                                        <img src={EmeraldLogo} alt="AI" className="chat-avatar" />
                                    )}

                                    <div className={`message ${msg.sender}`}>
                                        <strong>
                                            {msg.sender === 'user' ? 'Tú:' : 'IA:'}
                                        </strong>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Loader */}
                        {isLoading && <ChatLoader logoSrc={EmeraldLogo} />}
                    </div>
                </div>
            )}
        </div>
        
        {/* Input fijo abajo */}
        <div className="input-container">
            <div className="input-wrapper">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                    placeholder="Pregunta a EmeraldAI"
                    disabled={isLoading}
                />
                <button 
                    onClick={sendMessage} 
                    disabled={isLoading} 
                    className="send-button"
                >
                    {isLoading ? '...' : '▲'}
                </button>
            </div>
        </div>
    </div>
  );
}

export default App;
