import React, { useState, useEffect, useRef } from 'react';
import './App.css'; 

// NOTA: La variable VITE_APP_API_URL debe ser configurada en tu .env.development local.
// En producción (Vercel), será vacío, haciendo el fetch a /api/chat.
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || ''; 

// RUTA CRÍTICA: Se asume que el logo fue movido a la carpeta /public de Vercel.
const LOGO_SRC = "/EmraldAI.png"; 

// Componente Loader con el Logo giratorio (Para el estado isLoading)
const ChatLoader = () => (
    <div className="message bot message-loader">
        <div className="loader-container">
            <div className="spinner-border"></div>
            <img src={LOGO_SRC} alt="Loading" className="loader-logo" />
        </div>
        <p className="typing-indicator">IA: Escribiendo...</p>
    </div>
);

// Componente para el encabezado fijo (cuando la conversación ha iniciado)
const ChatHeaderFixed = () => (
    <div className="chat-header-fixed">
        <img 
            src={LOGO_SRC}
            alt="EmeraldAI Logo"
            className="header-logo-small"
        />
        <h1 className="title-small">EmeraldAI</h1>
    </div>
);

function App() {
  const initialMessage = { text: "¡Hola! Pregúntale a EmeraldAI.", sender: "bot" };
  
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
      // LLAMADA CORREGIDA: Usa API_BASE_URL para determinar la ruta completa (local o producción)
      const response = await fetch(`${API_BASE_URL}/api/chat`, { 
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
        text: `⚠️ Error: ${error.message || 'Error de conexión. Revisa el backend.'}`, 
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
        {!isInitialScreen && <ChatHeaderFixed />}
        
        {/* Área de contenido */}
        <div className="content-area">
            {isInitialScreen ? (
                /* PANTALLA INICIAL CENTRADA */
                <div className="initial-screen">
                    <div className="centered-header">
                        <img 
                            src={LOGO_SRC}
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
                                        <img src={LOGO_SRC} alt="AI" className="chat-avatar" />
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
                        {isLoading && <ChatLoader />}
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
