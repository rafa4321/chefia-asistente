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
  project: 'chefia-5b6ac', 
  location: 'us-east1', 
  googleAuthOptions: { credentials } 
});

// Modelo de Texto: Gemini 2.0 Flash Lite (Configuración Universal)
const textModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001',
  systemInstruction: {
    parts: [{ text: "Eres ChefIA Pro, un asistente culinario experto y universal. Tu objetivo es ayudar a los usuarios a crear recetas excepcionales. DEBES responder SIEMPRE en español. Estructura tus respuestas con: Introducción motivadora, Ingredientes (lista) y Preparación paso a paso." }]
  }
});

// Modelo de Imagen: Imagen 3 (Versión estable para evitar error 404)
const imageModel = vertexAI.getGenerativeModel({
  model: 'imagen-3.0-generate-001',
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log(`Generando contenido para: ${prompt}`);

    // Ejecución en paralelo para optimizar tiempo
    const [textResult, imageResult] = await Promise.all([
      textModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Dame una receta profesional para: ${prompt}` }] }]
      }),
      imageModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Professional food photography of ${prompt}, high resolution, elegant plating, cinematic lighting.` }] }]
      })
    ]);

    const recipeText = textResult.response.candidates[0].content.parts[0].text;
    const imageData = imageResult.response.candidates[0].content.parts[0].inlineData.data;

    res.json({ 
      recipe: recipeText, 
      image: `data:image/png;base64,${imageData}` 
    });

  } catch (error) {
    console.error("ERROR EN GENERACIÓN:", error.message);
    res.status(500).json({ error: 'Hubo un problema al generar la receta o la imagen.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`ChefIA Pro activa y universal en puerto ${port}`);
});