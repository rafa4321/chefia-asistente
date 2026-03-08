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

// Configuración de Seguridad
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const vertexAI = new VertexAI({ 
  project: 'chefia-5b6ac', 
  location: 'us-east1', 
  googleAuthOptions: { credentials } 
});

// Modelo 2.0 Flash Lite (el que activamos en el Studio)
const model = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001', 
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Ruta de generación de recetas
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt } = req.body;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const response = await result.response;
    // Extraemos el texto de forma segura
    const recipeText = response.candidates[0].content.parts[0].text;

    res.json({ recipe: recipeText });

  } catch (error) {
    console.error("ERROR VERTEX:", error.message);
    res.status(500).json({ error: 'Error al conectar con la IA' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor activo con Gemini 2.0 en puerto ${port}`);
});