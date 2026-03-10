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
  location: 'us-central1', // us-central1 suele tener mayor cuota para Imagen 3
  googleAuthOptions: { credentials } 
});

const textModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001',
  systemInstruction: {
    parts: [{ text: "Eres ChefIA Pro, un asistente culinario experto. Responde siempre en español con elegancia. Estructura: Introducción, Ingredientes y Preparación detallada." }]
  }
});

const imageModel = vertexAI.getGenerativeModel({
  model: 'imagen-3.0-generate-001',
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  const { prompt } = req.body;
  let recipeText = "";
  let imageData = null;

  try {
    // Generamos primero el texto (prioridad alta)
    const textResult = await textModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Receta profesional para: ${prompt}` }] }]
    });
    recipeText = textResult.response.candidates[0].content.parts[0].text;

    // Intentamos generar la imagen (prioridad secundaria)
    try {
      const imageResult = await imageModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Professional food photography of ${prompt}, cinematic lighting, 8k.` }] }]
      });
      imageData = `data:image/png;base64,${imageResult.response.candidates[0].content.parts[0].inlineData.data}`;
    } catch (imgError) {
      console.warn("Imagen no generada (Cuota o Error):", imgError.message);
      // No lanzamos error aquí para que la receta llegue aunque no haya foto
    }

    res.json({ recipe: recipeText, image: imageData });

  } catch (error) {
    console.error("ERROR CRÍTICO:", error.message);
    res.status(500).json({ error: 'Error al conectar con la inteligencia culinaria.' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(port, () => console.log(`ChefIA Pro activa en puerto ${port}`));