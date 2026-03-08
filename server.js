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

const vertexAI = new VertexAI({ 
  project: 'chefia-5b6ac', 
  location: 'us-east1', 
  googleAuthOptions: { credentials } 
});

const model = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001',
  // INSTRUCCIONES DE SISTEMA PARA RECUPERAR LA IDENTIDAD
  systemInstruction: {
    parts: [{ text: "Eres ChefIA, un asistente culinario experto. Tu objetivo es proporcionar recetas detalladas, consejos de cocina y gestión de ingredientes. DEBES responder SIEMPRE en español, de forma amable y profesional." }]
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt } = req.body;
    // Reforzamos la instrucción de idioma en cada consulta
    const fullPrompt = `Instrucción: Responde estrictamente en español. Consulta: ${prompt}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
    });

    const response = await result.response;
    const text = response.candidates[0].content.parts[0].text;
    res.json({ recipe: text });

  } catch (error) {
    console.error("ERROR VERTEX:", error.message);
    res.status(500).json({ error: 'Error al conectar con ChefIA' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`ChefIA (Español) operativa en puerto ${port}`);
});