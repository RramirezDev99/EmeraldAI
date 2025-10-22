import React, { useState, useEffect, useRef } from 'react';

// Imagen desde carpeta public (CORREGIDO)
const logoImage = './src/assets/EmraldAI.png';

// Componente Loader con el Logo giratorio
const ChatLoader = () => (
    <div className="message bot message-loader">
        <div className="loader-container">
            <div className="spinner-border"></div>
            <img 
                src={logoImage}
                alt="EmeraldAI Logo" 
                className="loader-logo"
            />
        </div>
        <p className="typing-indicator">IA: Escribiendo...</p>
    </div>
);

// Componente para el encabezado fijo
const ChatHeaderFixed = () => (
    <div className="chat-header-fixed">
        <img 
            src={logoImage}
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
      const response = await fetch('http://localhost:3000/api/chat', {
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
        text: `⚠️ Error: ${error.message || 'No se pudo conectar.'}`, 
        sender: "system" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isInitialScreen = messages.length === 1 && messages[0].sender === 'bot'; 

  return (
    <>
        <style jsx>{`
            /* Reset y Variables */
            :root {
                --color-bg-dark: #222222; 
                --color-panel-dark: #333333; 
                --color-text-light: #e0e0e0;
                --color-text-secondary: #999999;
                --color-emerald-green: #00d47e; 
                --color-emerald-light: #52ffaa;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                background-color: var(--color-bg-dark);
                color: var(--color-text-light);
                width: 100vw;
                height: 100vh;
                overflow: hidden;
            }
            
            #root {
                width: 100%;
                height: 100%;
            }
            
            /* CONTENEDOR PRINCIPAL */
            .app-container {
                width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
                position: relative;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            /* HEADER FIJO - Solo visible cuando NO es pantalla inicial */
            .chat-header-fixed {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 70px;
                
                display: flex;
                align-items: center;
                padding: 0 40px;
                
                background-color: var(--color-bg-dark);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                z-index: 100;
            }
            
            .header-logo-small {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                margin-right: 12px;
                object-fit: cover;
            }
            
            .title-small {
                font-size: 1.2rem;
                font-weight: 500;
                margin: 0;
            }
            
            /* ÁREA DE CONTENIDO */
            .content-area {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                position: relative;
            }
            
            /* PANTALLA INICIAL CENTRADA */
            .initial-screen {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding-bottom: 150px; /* Espacio para el input */
            }
            
            .centered-header {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            
            .header-logo-large {
                width: 80px;
                height: 80px;
                border-radius: 12px;
                margin-bottom: 20px;
                /* QUITADO: box-shadow (resplandor verde) */
                object-fit: cover;
            }
            
            .main-title {
                font-size: 2.5rem;
                font-weight: 600;
                margin: 0;
                letter-spacing: -0.5px;
            }
            
            /* ÁREA DE CHAT CON MENSAJES */
            .chat-area {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                padding-top: 70px; /* Altura del header */
                padding-bottom: 100px; /* Altura del input */
            }
            
            .chat-messages {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 20px 40px;
                display: flex;
                flex-direction: column;
            }
            
            /* Scrollbar personalizado */
            .chat-messages::-webkit-scrollbar {
                width: 6px;
            }
            
            .chat-messages::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .chat-messages::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }
            
            .chat-messages::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            /* MENSAJES */
            .message {
                margin-bottom: 16px;
                padding: 14px 18px;
                border-radius: 12px;
                max-width: 75%;
                line-height: 1.5;
                word-wrap: break-word;
                animation: fadeInUp 0.3s ease-out;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .message.user {
                background-color: var(--color-emerald-green);
                color: white;
                align-self: flex-end;
                margin-left: auto;
            }
            
            .message.bot {
                background-color: var(--color-panel-dark);
                color: var(--color-text-light);
                align-self: flex-start;
                margin-right: auto;
            }
            
            .message.system {
                background-color: rgba(244, 67, 54, 0.1);
                color: #ff6b6b;
                align-self: center;
                text-align: center;
            }
            
            .message strong {
                display: block;
                margin-bottom: 4px;
                font-size: 0.85rem;
                opacity: 0.8;
            }
            
            /* LOADER - CENTRADO */
            .message-loader {
                background: none !important;
                box-shadow: none !important;
                max-width: 150px !important;
                align-self: center !important;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
                /* CRÍTICO: Fuerza el centrado horizontal */
                margin: 30px auto !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }
            
            .loader-container {
                position: relative;
                width: 60px;
                height: 60px;
                margin-bottom: 10px;
            }
            
            .loader-logo {
                width: 40px;
                height: 40px;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border-radius: 6px;
                z-index: 2;
                object-fit: cover;
            }
            
            .spinner-border {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                position: absolute;
                border: 4px solid transparent;
                border-top-color: var(--color-emerald-green);
                border-right-color: var(--color-emerald-light);
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .typing-indicator {
                color: var(--color-text-secondary);
                font-size: 0.85rem;
                text-align: center;
            }
            
            /* INPUT ÁREA - FIJO ABAJO */
            .input-container {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 20px 40px 30px;
                background: linear-gradient(to top, var(--color-bg-dark) 80%, transparent);
                z-index: 50;
            }
            
            .input-wrapper {
                max-width: 800px;
                margin: 0 auto;
                background-color: var(--color-panel-dark);
                border-radius: 24px;
                padding: 10px 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .input-wrapper input {
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                color: var(--color-text-light);
                font-size: 1rem;
                padding: 8px 12px;
            }
            
            .input-wrapper input::placeholder {
                color: var(--color-text-secondary);
            }
            
            .send-button {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                background-color: var(--color-emerald-green);
                color: white;
                font-size: 1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            
            .send-button:hover:not(:disabled) {
                background-color: #00b368;
                transform: scale(1.05);
            }
            
            .send-button:disabled {
                background-color: #555555;
                color: #999;
                cursor: not-allowed;
            }
            
            /* RESPONSIVE */
            @media (max-width: 768px) {
                .chat-header-fixed,
                .input-container {
                    padding-left: 20px;
                    padding-right: 20px;
                }
                
                .chat-messages {
                    padding: 20px;
                }
                
                .main-title {
                    font-size: 2rem;
                }
                
                .header-logo-large {
                    width: 60px;
                    height: 60px;
                }
                
                .message {
                    max-width: 85%;
                }
                
                /* Asegurar centrado del loader en móvil */
                .message-loader {
                    margin: 30px auto !important;
                }
            }
        `}</style>
    
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
                                src={logoImage}
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
                                        className={`message ${msg.sender}`}
                                    >
                                        <strong>
                                            {msg.sender === 'user' ? 'Tú:' : 'IA:'}
                                        </strong>
                                        {msg.text}
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
    </>
  );
}

export default App;