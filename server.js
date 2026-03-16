import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Inicialización base
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate-recipe', async (req, res) => {
    try {
        const { prompt, ingredients, preferences } = req.body;
        
        // CONFIGURACIÓN EXPLÍCITA: Forzamos v1 en cada petición
        const model = genAI.getGenerativeModel(
            { model: "gemini-1.5-flash" },
            { apiVersion: 'v1' }
        );
        
        const input = prompt || ingredients;
        const extra = preferences ? ` con estas preferencias: ${preferences}` : "";

        const result = await model.generateContent(`ChefIA Pro: Crea una receta profesional con ${input}${extra}`);
        const response = await result.response;
        
        // Respuesta limpia para el frontend
        res.json({ recipe: response.text() });

    } catch (error) {
        console.error("ERROR EN SERVIDOR:", error.message);
        res.status(500).json({ 
            error: "Fallo de comunicación con Gemini",
            message: error.message 
        });
    }
});

// Verificación de salud para Render
app.get('/health', (req, res) => res.send("Servidor ChefIA Pro Activo"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> ChefIA Pro en línea y escuchando en puerto ${PORT}`);
});