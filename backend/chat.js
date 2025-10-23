import express from 'express';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';

// NOTA: En Vercel, las variables de entorno (GEMINI_API_KEY)
// se configuran directamente en el dashboard de Vercel.

const app = express();
app.use(cors()); 
app.use(express.json());

// Inicializa el cliente de Gemini. Vercel lee la clave de GEMINI_API_KEY.
const ai = new GoogleGenAI({});

// El endpoint que Vercel mapeará a /api/chat
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    // CRÍTICO: Si la clave no está configurada en Vercel, salta un error 500 controlado.
    if (!process.env.GEMINI_API_KEY) {
        // Devolvemos un JSON para que el frontend no muestre el error HTML
        return res.status(500).json({ error: "Gemini API Key is not configured on Vercel environment variables." });
    }
    
    if (!message) {
        return res.status(400).json({ error: 'Falta el mensaje del usuario.' });
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: [{ role: "user", parts: [{ text: message }] }],
        });

        const botResponse = response.text;
        // La respuesta exitosa
        res.status(200).json({ text: botResponse });

    } catch (error) {
        console.error("Error al comunicarse con la Gemini API:", error);
        // Devuelve un error JSON para que el frontend lo pueda manejar
        res.status(500).json({ error: "Error interno del servidor al generar la respuesta." });
    }
});

// ¡CRÍTICO!: Exportamos la aplicación Express para que Vercel la use como función.
export default app; 
