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

// Configuración de Vertex AI con ubicación estable
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
const vertexAI = new VertexAI({ 
  project: credentials.project_id, 
  location: 'us-central1', 
  googleAuthOptions: { credentials } 
});

// Modelo de Texto: Gemini 2.0 Flash Lite (Respuesta Universal)
const textModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001',
  systemInstruction: {
    parts: [{ text: "Eres ChefIA Pro, un asistente culinario experto. Saluda de forma cordial. Tu misión es crear recetas profesionales y detalladas en ESPAÑOL. Adapta siempre la receta a las preferencias dietéticas que el usuario indique. Estructura: Introducción, Ingredientes y Preparación." }]
  }
});

// Modelo de Imagen: Imagen 3 Estable
const imageModel = vertexAI.getGenerativeModel({
  model: 'imagen-3.0-generate-001',
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  const { prompt, preferences } = req.body;
  let recipeText = "";
  let imageData = null;

  try {
    // 1. Generar Texto (Obligatorio)
    const context = preferences ? ` (Considerando estas preferencias: ${preferences})` : "";
    const textResult = await textModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Dame una receta profesional para: ${prompt}.${context}` }] }]
    });
    recipeText = textResult.response.candidates[0].content.parts[0].text;

    // 2. Intentar Generar Imagen (Opcional - Respaldo contra errores 429/404)
    try {
      const imageResult = await imageModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Professional food photography of ${prompt}, high resolution, gourmet plating.` }] }]
      });
      if (imageResult.response.candidates[0].content.parts[0].inlineData) {
        imageData = `data:image/png;base64,${imageResult.response.candidates[0].content.parts[0].inlineData.data}`;
      }
    } catch (imgError) {
      console.warn("Imagen no disponible en este momento:", imgError.message);
      // No bloqueamos la respuesta, enviamos solo el texto
    }

    res.json({ recipe: recipeText, image: imageData });

  } catch (error) {
    console.error("Error Crítico:", error.message);
    res.status(500).json({ error: 'Error al generar la receta.' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(port, () => console.log(`ChefIA Pro operativo en puerto ${port}`));