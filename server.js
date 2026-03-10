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

// Configuración de Vertex AI - Cambiado a us-central1 para mayor estabilidad
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
const vertexAI = new VertexAI({ 
  project: credentials.project_id, 
  location: 'us-central1', 
  googleAuthOptions: { credentials } 
});

// Modelo de Texto: Gemini 2.0 Flash Lite (Rápido y Universal)
const textModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001',
  systemInstruction: {
    parts: [{ text: "Eres ChefIA Pro, un asistente culinario experto. Saluda cordialmente. Crea recetas gourmet en ESPAÑOL. Estructura: Título, Tiempo, Calorías, Ingredientes y Preparación paso a paso. Adapta la receta a las preferencias dietéticas recibidas." }]
  }
});

// Modelo de Imagen: Imagen 3
const imageModel = vertexAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  const { prompt, preferences } = req.body;
  
  try {
    // 1. Generar la Receta (Prioridad)
    const context = preferences ? ` (Preferencias: ${preferences})` : "";
    const textResult = await textModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Receta profesional para: ${prompt}.${context}` }] }]
    });
    const recipeText = textResult.response.candidates[0].content.parts[0].text;

    // 2. Intento de Imagen (Blindado: si falla por cuota, imageData queda null)
    let imageData = null;
    try {
      const imageResult = await imageModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Gourmet food plating of ${prompt}, high resolution, cinematic lighting.` }] }]
      });
      if (imageResult.response.candidates[0].content.parts[0].inlineData) {
        imageData = `data:image/png;base64,${imageResult.response.candidates[0].content.parts[0].inlineData.data}`;
      }
    } catch (imgErr) {
      console.warn("Imagen omitida por límites de cuota (429/404).");
    }

    res.json({ recipe: recipeText, image: imageData });

  } catch (error) {
    console.error("Error en servidor:", error);
    res.status(500).json({ error: 'No se pudo generar la receta.' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(port, () => console.log(`ChefIA Pro operativo en puerto ${port}`));