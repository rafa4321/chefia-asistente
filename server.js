import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 10000;

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
const vertexAI = new VertexAI({ project: 'chefia-5b6ac', location: 'us-east1', googleAuthOptions: { credentials } });

// Modelo de Texto: Gemini 2.0 Flash Lite (Estable y en Español)
const textModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001',
  systemInstruction: {
    parts: [{ text: "Eres ChefIA Pro, el asistente culinario de Rafael. Responde siempre en español. Estructura las recetas con elegancia: Introducción, Ingredientes y Preparación detallada." }]
  }
});

// Modelo de Imagen: Imagen 3 (Cambiado de 'preview' a versión estable 006)
const imageModel = vertexAI.getPreviewGenerativeModel({
  model: 'image-generation-006',
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt } = req.body;

    // Ejecución paralela de texto e imagen fotorrealista
    const [textResult, imageResult] = await Promise.all([
      textModel.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      imageModel.generateContent({ 
        contents: [{ role: 'user', parts: [{ text: `Professional food photography, delicious ${prompt}, high resolution, cinematic lighting, 8k.` }] }] 
      })
    ]);

    const recipeText = textResult.response.candidates[0].content.parts[0].text;
    const imageData = imageResult.response.candidates[0].content.parts[0].inlineData.data;

    res.json({ 
      recipe: recipeText, 
      image: `data:image/png;base64,${imageData}` 
    });

  } catch (error) {
    console.error("ERROR EN GENERACIÓN:", error.message);
    res.status(500).json({ error: 'Error en la conexión con la inteligencia culinaria' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(port, () => console.log(`ChefIA Pro funcionando en puerto ${port}`));