import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google-cloud/generative-ai'; // Cambio a la API más estable
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 10000;

// Usamos la API KEY directamente para mayor simplicidad en esta etapa
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  const { prompt, preferences } = req.body;
  try {
    const fullPrompt = `Actúa como ChefIA Pro. Genera una receta gourmet detallada para: ${prompt}. Considera estas restricciones: ${preferences}. Responde en formato elegante y profesional.`;
    
    const result = await model.generateContent(fullPrompt);
    const recipeText = result.response.text();

    // Enviamos solo el texto por ahora para asegurar que la app base funcione
    res.json({ recipe: recipeText, image: null }); 
  } catch (error) {
    console.error("Error en la cocina:", error);
    res.status(500).json({ error: 'La cocina está temporalmente cerrada. Reintenta en un momento.' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.listen(port, () => console.log(`ChefIA Pro listo en puerto ${port}`));