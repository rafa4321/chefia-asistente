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

// --- CONFIGURACIÓN DE SEGURIDAD (CAMINO A) ---
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  console.error("ERROR CRÍTICO: No se encontró la variable GOOGLE_APPLICATION_CREDENTIALS_JSON");
  process.exit(1);
}

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Inicializamos Vertex AI con la ubicación exacta
const vertexAI = new VertexAI({ 
  project: 'chefia-5b6ac', 
  location: 'us-east1', // Asegúrate de que esta sea la región de tu proyecto
  googleAuthOptions: { credentials } 
});

// Usamos el nombre de modelo específico para evitar el error 404
const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash-001', 
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// RUTA DE GENERACIÓN
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt } = req.body;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const response = await result.response;
    const text = response.candidates[0].content.parts[0].text;

    res.json({ recipe: text });

  } catch (error) {
    console.error("ERROR EN MOTOR VERTEX:", error.message);
    res.status(500).json({ 
      error: 'Error en el modelo de Google Cloud',
      details: error.message 
    });
  }
});

// MANEJO DE FRONTEND
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`ChefIA operativa bajo el Plan Blaze en puerto ${port}`);
});