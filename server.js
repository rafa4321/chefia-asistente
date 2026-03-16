import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE GOOGLE AI (Asegúrate de que GEMINI_API_KEY esté en Render)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate-recipe', async (req, res) => {
    try {
        const { ingredients, prompt, preferences } = req.body;
        
        // Usamos el nombre base del modelo para evitar el error 404 visto en logs
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Consolidamos la entrada (el frontend envía 'prompt' o 'ingredients')
        const input = prompt || ingredients;
        const extra = preferences ? ` con estas preferencias: ${preferences}` : "";

        const result = await model.generateContent(`ChefIA Pro: Crea una receta detallada con ${input}${extra}`);
        const response = await result.response;
        const text = response.text();
        
        // Enviamos la respuesta limpia
        res.json({ recipe: text });

    } catch (error) {
        // Log detallado para ver en el panel de Render si algo falla
        console.error("Error raíz en el servidor:", error.message);
        res.status(500).json({ 
            error: "Fallo de conexión con Google AI Studio",
            details: error.message 
        });
    }
});

// Ruta de salud para verificar operatividad
app.get('/health', (req, res) => res.send("Servidor Activo"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> ChefIA Pro en línea y escuchando en puerto ${PORT}`);
});