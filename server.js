import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-recipe', async (req, res) => {
    const API_KEY = process.env.GEMINI_API_KEY;
    // Usamos la URL directa del endpoint de Google
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const { prompt } = req.body;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Actúa como un chef profesional de alto nivel. Crea una receta detallada y exquisita para: ${prompt}. Estructura la respuesta con Título, Ingredientes y Pasos claros.` }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Error de Google API:", data.error);
            return res.status(data.error.code || 500).json({ error: data.error.message });
        }

        // Extracción segura del contenido generado
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const recipeText = data.candidates[0].content.parts[0].text;
            res.json({ recipe: recipeText });
        } else {
            throw new Error("Estructura de respuesta inesperada de Google");
        }

    } catch (error) {
        console.error("FALLO CRÍTICO:", error.message);
        res.status(500).json({ error: "Error de comunicación", details: error.message });
    }
});

app.get('/health', (req, res) => res.send("ChefIA Pro está vivo"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> Servidor ChefIA Pro operativo en puerto ${PORT}`);
});