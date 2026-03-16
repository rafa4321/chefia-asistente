import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE GOOGLE AI
// La API Key debe estar configurada en el panel de Render como GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate-recipe', async (req, res) => {
    try {
        const { ingredients, prompt, preferences } = req.body;
        
        // --- CAMBIO CRÍTICO PARA EVITAR EL 404 ---
        // Forzamos el uso de la apiVersion: 'v1' para saltar la beta
        const model = genAI.getGenerativeModel(
            { model: "gemini-1.5-flash" },
            { apiVersion: 'v1' }
        );
        
        // Consolidamos la entrada por si el front envía 'prompt' o 'ingredients'
        const input = prompt || ingredients;
        const diet = preferences ? ` con estas preferencias: ${preferences}` : "";

        const result = await model.generateContent(`ChefIA Pro: Crea una receta profesional y detallada con ${input}${diet}`);
        const response = await result.response;
        const text = response.text();
        
        // Enviamos la respuesta que espera el frontend
        res.json({ recipe: text });

    } catch (error) {
        console.error("DETALLE DEL ERROR EN SERVIDOR:", error.message);
        res.status(500).json({ 
            error: "Fallo de comunicación con Gemini",
            message: error.message 
        });
    }
});

// Ruta de salud para verificar operatividad en Render
app.get('/health', (req, res) => res.send("Servidor ChefIA Activo"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> ChefIA Pro en línea y escuchando en puerto ${PORT}`);
});