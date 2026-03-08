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

// Usamos el modelo 2.0 que ya tienes configurado
const model = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001',
  systemInstruction: {
    parts: [{ text: "Eres ChefIA, el asistente experto en inteligencia culinaria de Rafael. Tu tono es profesional, amable y apasionado por la cocina. DEBES responder SIEMPRE en español. Estructura tus recetas con: Introducción, Ingredientes (lista numerada), Preparación y Consejos del Chef." }]
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Como ChefIA, ayúdame con esto en español: ${prompt}` }] }]
    });

    const response = await result.response;
    res.json({ recipe: response.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ error: 'Error en la conexión culinaria' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`ChefIA restaurada en puerto ${port}`);
});