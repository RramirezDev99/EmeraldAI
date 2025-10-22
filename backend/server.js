// EmeraldAI/backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializa el cliente de Gemini (usa la clave de .env)
const ai = new GoogleGenAI({});

// Middlewares
app.use(cors()); 
app.use(express.json());

// Endpoint POST para manejar las peticiones del chatbot
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Falta el mensaje del usuario.' });
    }

    try {
        // Usa el modelo gemini-2.5-flash para respuestas rápidas
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: message }] }],
        });

        // Devuelve la respuesta del modelo al frontend
        res.json({ text: response.text });

    } catch (error) {
        console.error("Error al comunicarse con la Gemini API:", error);
        res.status(500).json({ error: "Error interno del servidor al procesar la solicitud." });
    }
});

app.listen(PORT, () => {
    console.log(`EmeraldAI-API escuchando en http://localhost:${PORT}`);
});