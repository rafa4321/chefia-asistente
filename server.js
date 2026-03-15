import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de Google AI con la clave de Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Ruta para generar recetas
app.post('/api/generate-recipe', async (req, res) => {
    const { ingredients } = req.body;

    // Validación de entrada
    if (!ingredients || ingredients.trim() === "") {
        return res.status(400).json({ error: "Por favor, escribe algunos ingredientes." });
    }

    try {
        console.log("Iniciando generación de receta para:", ingredients);

        // Usamos el modelo gemini-1.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Eres ChefIA, un asistente culinario experto. 
        Crea una receta detallada usando estos ingredientes: ${ingredients}.
        La respuesta debe incluir:
        1. Un nombre creativo para el plato.
        2. Tiempo de preparación.
        3. Lista de ingredientes con medidas.
        4. Pasos de preparación claros y numerados.
        Formato: Profesional y fácil de leer.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Receta generada con éxito");
        res.json({ recipe: text });

    } catch (error) {
        console.error("DETALLE DEL ERROR EN EL SERVIDOR:", error.message);
        res.status(500).json({ 
            error: "Error interno en la cocina de ChefIA.",
            details: error.message 
        });
    }
});

// Ruta de salud
app.get('/health', (req, res) => {
    res.send("ChefIA Pro está operando correctamente en Render");
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> ChefIA Pro en línea y escuchando en puerto ${PORT}`);
});