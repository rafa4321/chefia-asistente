import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Configuración de rutas y variables de entorno
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 10000;

// Inicialización de Google AI usando la variable de Render
// Asegúrate de que en Render la variable se llame exactamente GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());

// Servir archivos estáticos desde la carpeta 'dist' generada por Vite
app.use(express.static(path.join(__dirname, 'dist')));

// RUTA CRÍTICA: Generación de recetas
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("La clave GEMINI_API_KEY no está configurada en el servidor.");
    }

   const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }, { apiVersion: 'v1' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ recipe: text });
  } catch (error) {
    // Este log aparecerá en la pestaña 'Logs' de Render para diagnóstico
    console.error("ERROR DETECTADO EN GOOGLE AI:", error.message);
    
    res.status(500).json({ 
      error: 'Error en el servidor al conectar con la IA',
      details: error.message 
    });
  }
});

// Ruta para manejar el Frontend (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor activo en puerto ${port}`);
});