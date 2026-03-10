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
  project: credentials.project_id, 
  location: 'us-central1', // Región recomendada para estabilidad
  googleAuthOptions: { credentials } 
});

// Usamos Gemini 1.5 Flash para las recetas (rápido y estable)
const textModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: {
    parts: [{ text: "Eres ChefIA Pro. Genera recetas GOURMET en ESPAÑOL. Tono elegante." }]
  }
});

// CORRECCIÓN: Usamos el modelo estable imagen-3.0
const imageModel = vertexAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  const { prompt, preferences } = req.body;
  try {
    // 1. Generar texto
    const textResult = await textModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Receta para: ${prompt}. Dieta: ${preferences}` }] }]
    });
    const recipeText = textResult.response.candidates[0].content.parts[0].text;

    // 2. Generar imagen con blindaje (Si falla 429, enviamos la receta sin imagen)
    let imageData = null;
    try {
      const imageResult = await imageModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Professional gourmet food photography of ${prompt}, high resolution.` }] }]
      });
      if (imageResult.response.candidates[0].content.parts[0].inlineData) {
        imageData = `data:image/png;base64,${imageResult.response.candidates[0].content.parts[0].inlineData.data}`;
      }
    } catch (imgError) {
      console.warn("Fallo de imagen (posible cuota 429). Continuando solo con texto.");
    }

    res.json({ recipe: recipeText, image: imageData });
  } catch (error) {
    console.error("Error central:", error);
    res.status(500).json({ error: 'Error en la cocina central.' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.listen(port, () => console.log(`ChefIA Pro activo en puerto ${port}`));