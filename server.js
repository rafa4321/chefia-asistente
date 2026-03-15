import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const app = express();

// Configuración de Seguridad y CORS
app.use(cors());
app.use(express.json());

// Verificación de la API Key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("CRÍTICO: No se encontró GEMINI_API_KEY en las variables de entorno.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Ruta principal para generar recetas
app.post('/api/generate-recipe', async (req, res) => {
    const { ingredients } = req.body;

    if (!ingredients || ingredients.trim() === "") {
        return res.status(400).json({ error: "Por favor, ingresa algunos ingredientes." });
    }

    try {
        console.log("Procesando receta para:", ingredients);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Eres un chef experto. Crea una receta creativa con estos ingredientes: ${ingredients}. 
        Formatea la respuesta con:
        1. Nombre del plato (en negrita)
        2. Tiempo estimado
        3. Lista de ingredientes con cantidades
        4. Instrucciones numeradas paso a paso.
        Usa un tono amable y profesional.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("¡Receta generada con éxito!");
        res.json({ recipe: text });

    } catch (error) {
        console.error("FALLO EN LA COMUNICACIÓN CON GEMINI:", error.message);
        res.status(500).json({ 
            error: "Hubo un problema al cocinar tu receta.",
            details: error.message 
        });
    }
});

// Ruta de salud
app.get('/health', (req, res) => {
    res.send("Servidor de ChefIA operando correctamente");
});

// Render maneja el puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChefIA Pro en línea y escuchando en puerto ${PORT}`);
});