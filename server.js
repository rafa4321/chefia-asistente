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

// CONFIGURACIÓN PROFESIONAL DE GOOGLE CLOUD VERTEX AI
// Usamos tu ID de proyecto confirmado en las capturas
const project = 'chefia-5b6ac';
const location = 'us-central1'; // Región recomendada para estabilidad

// Inicializamos la IA con la infraestructura de producción
const vertexAI = new VertexAI({ project: project, location: location });

// Definimos el modelo estable (Sin rutas beta que causen error 404)
const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

app.use(express.json());

// Servir frontend
app.use(express.static(path.join(__dirname, 'dist')));

// RUTA PARA GENERAR RECETAS
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt } = req.body;

    // Llamada al motor de Google Cloud
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Nueva estructura de respuesta de Vertex AI
    const text = response.candidates[0].content.parts[0].text;

    res.json({ recipe: text });

  } catch (error) {
    // Log crítico para ver en el dashboard de Render
    console.error("ERROR EN MOTOR CHEFIA:", error.message);
    
    res.status(500).json({ 
      error: 'Error de conexión con la infraestructura de Google',
      details: error.message 
    });
  }
});

// Manejo de rutas Frontend (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`ChefIA conectada a Google Cloud en puerto ${port}`);
});