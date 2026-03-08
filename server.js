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

// Modelo para TEXTO: Gemini 2.0 Flash Lite
const textModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001',
  systemInstruction: {
    parts: [{ text: "Eres ChefIA, asistente de Rafael. Responde SIEMPRE en español. Estructura: Saludo, Ingredientes y Preparación." }]
  }
});

// Modelo para IMAGEN: Gemini 3.1 Flash Image Preview
const imageModel = vertexAI.getGenerativeModel({
  model: 'gemini-3.1-flash-image-preview',
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt } = req.body;

    // Generamos ambos contenidos en paralelo para ahorrar tiempo
    const [textResult, imageResult] = await Promise.all([
      textModel.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      imageModel.generateContent({ 
        contents: [{ role: 'user', parts: [{ text: `Professional food photography of ${prompt}, high resolution, delicious.` }] }] 
      })
    ]);

    const recipeText = textResult.response.candidates[0].content.parts[0].text;
    const imageData = imageResult.response.candidates[0].content.parts[0].inlineData.data;

    res.json({ 
      recipe: recipeText, 
      image: `data:image/png;base64,${imageData}` 
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Error en la generación' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => console.log(`ChefIA Multimodal en puerto ${port}`));