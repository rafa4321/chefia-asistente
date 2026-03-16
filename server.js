import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Inicialización de Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate-recipe', async (req, res) => {
    try {
        const { ingredients, prompt, preferences } = req.body;
        
        // FORZAMOS LA VERSIÓN v1 (Esto elimina el error 404 de v1beta)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            apiVersion: 'v1' 
        });
        
        const input = prompt || ingredients;
        const extra = preferences ? ` con estas preferencias: ${preferences}` : "";

        // Generación de contenido
        const result = await model.generateContent(`ChefIA Pro: Crea una receta detallada con ${input}${extra}`);
        const response = await result.response;
        const text = response.text();
        
        // Respuesta exitosa
        res.json({ recipe: text });

    } catch (error) {
        // Log profesional para el panel de Render
        console.error("DETALLE DEL ERROR EN SERVIDOR:", error.message);
        res.status(500).json({ 
            error: "Fallo de comunicación con la IA",
            message: error.message 
        });
    }
});

// Ruta de salud para verificar que Render está vivo
app.get('/health', (req, res) => res.send("Servidor Activo"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> ChefIA Pro en línea y escuchando en puerto ${PORT}`);
});