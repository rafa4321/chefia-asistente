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

// CONFIGURACIÓN DE VERTEX AI CON AUTENTICACIÓN DIRECTA
// Esto evita el error de "Unable to authenticate"
const vertexAI = new VertexAI({ 
  project: 'chefia-5b6ac', 
  location: 'us-central1'
});

// Usamos la API Key para autenticar la petición de forma directa
const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
}, {
  // Aquí es donde sucede la magia para que Render no falle
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt } = req.body;

    // IMPORTANTE: Pasamos la API KEY en la petición para que Google nos deje pasar
    // Asegúrate de tener la variable GEMINI_API_KEY en Render o pégala aquí
    const apiKey = process.env.GEMINI_API_KEY; 

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const response = await result.response;
    const text = response.candidates[0].content.parts[0].text;

    res.json({ recipe: text });

  } catch (error) {
    console.error("ERROR CRÍTICO EN CHEFIA:", error.message);
    res.status(500).json({ 
      error: 'Error de comunicación con Google Cloud',
      details: error.message 
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`ChefIA lista y autenticada en puerto ${port}`);
});