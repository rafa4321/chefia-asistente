import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE GOOGLE AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate-recipe', async (req, res) => {
    try {
        const { ingredients } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        const result = await model.generateContent(`ChefIA: Crea una receta con ${ingredients}`);
        const response = await result.response;
        
        res.json({ recipe: response.text() });
    } catch (error) {
        console.error("Error raíz:", error.message);
        res.status(500).json({ error: "Fallo de conexión con Google AI Studio" });
    }
});

// Ruta simple para verificar que el servidor está VIVO
app.get('/health', (req, res) => res.send("Servidor Activo"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> ChefIA Pro en línea y escuchando en puerto ${PORT}`);
});