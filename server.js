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

// Configuración robusta de Vertex AI
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
const vertexAI = new VertexAI({ 
  project: credentials.project_id, 
  location: 'us-central1', 
  googleAuthOptions: { credentials } 
});

// Modelo de Texto: Gemini 2.0 Flash Lite (Respuesta instantánea)
const textModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001',
  systemInstruction: {
    parts: [{ text: "Eres ChefIA Pro, un asistente culinario de alta gama. Genera recetas gourmet en ESPAÑOL. Usa un tono elegante. Estructura: Título, Tiempo, Calorías, Ingredientes y Preparación detallada." }]
  }
});

// Modelo de Imagen: Imagen 3 (Estándar para evitar errores 404 de versiones experimentales)
const imageModel = vertexAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  const { prompt, preferences } = req.body;
  
  try {
    // 1. Generar Receta
    const context = preferences ? ` (Preferencias: ${preferences})` : "";
    const textResult = await textModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Receta de autor para: ${prompt}.${context}` }] }]
    });
    const recipeText = textResult.response.candidates[0].content.parts[0].text;

    // 2. Intento de Imagen con blindaje (Si falla 429 o 404, devuelve null)
    let imageData = null;
    try {
      const imageResult = await imageModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Professional gourmet food photography of ${prompt}, cinematic lighting, high resolution, minimalist plating.` }] }]
      });
      if (imageResult.response.candidates[0].content.parts[0].inlineData) {
        imageData = `data:image/png;base64,${imageResult.response.candidates[0].content.parts[0].inlineData.data}`;
      }
    } catch (imgError) {
      console.warn("Imagen omitida por límites de cuota de Google.");
    }

    res.json({ recipe: recipeText, image: imageData });
  } catch (error) {
    console.error("Error crítico:", error);
    res.status(500).json({ error: 'Error en la cocina central.' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.listen(port, () => console.log(`ChefIA Pro operativo en puerto ${port}`));