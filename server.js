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

// Configuración de Vertex AI
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
const vertexAI = new VertexAI({ 
  project: credentials.project_id, 
  location: 'us-central1', 
  googleAuthOptions: { credentials } 
});

// Modelos: Flash Lite para velocidad y ahorro, e Imagen 3 para fotos
const textModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001',
  systemInstruction: {
    parts: [{ text: "Eres ChefIA Pro. Genera recetas gourmet detalladas en ESPAÑOL. Usa un tono profesional. Estructura: Título, Tiempo, Calorías, Ingredientes y Pasos." }]
  }
});

const imageModel = vertexAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  const { prompt, preferences } = req.body;
  console.log(`Generando para: ${prompt}`);

  try {
    // 1. Generar Receta
    const context = preferences ? ` (Preferencia: ${preferences})` : "";
    const textResult = await textModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Receta profesional para: ${prompt}.${context}` }] }]
    });
    const recipeText = textResult.response.candidates[0].content.parts[0].text;

    // 2. Intentar Imagen con Blindaje (Si falla, devuelve null pero no rompe el proceso)
    let imageData = null;
    try {
      const imageResult = await imageModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Gourmet food photo of ${prompt}, studio lighting.` }] }]
      });
      imageData = `data:image/png;base64,${imageResult.response.candidates[0].content.parts[0].inlineData.data}`;
    } catch (e) {
      console.log("Imagen omitida por cuota.");
    }

    res.json({ recipe: recipeText, image: imageData });
  } catch (error) {
    res.status(500).json({ error: 'Error en generación.' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.listen(port, () => console.log(`ChefIA Pro operativo en puerto ${port}`));