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
  location: 'us-east1', // Región confirmada en tu captura
  googleAuthOptions: { credentials } 
});

// Usamos el nombre base sin versiones extra
const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash', 
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const response = await result.response;
    res.json({ recipe: response.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error("ERROR VERTEX:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor en puerto ${port}`);
});