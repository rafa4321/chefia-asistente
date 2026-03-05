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

// Inicialización de Google AI
// Se utiliza la variable GEMINI_API_KEY configurada en los Environment Variables de Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());

// Servir archivos estáticos desde la carpeta 'dist' generada por el build de Vite
app.use(express.static(path.join(__dirname, 'dist')));

// RUTA PARA GENERAR RECETAS
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("La clave GEMINI_API_KEY no está configurada en el servidor.");
    }

    // CONFIGURACIÓN DE MÁXIMA COMPATIBILIDAD:
    // 1. Usamos 'gemini-1.5-flash' que es el estándar actual.
    // 2. No forzamos versiones de API (v1 o v1beta) para que la librería decida la ruta más estable.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Enviamos la respuesta al frontend
    res.json({ recipe: text });

  } catch (error) {
    // Este log es fundamental para el diagnóstico en la pestaña 'Logs' de Render
    console.error("ERROR DETECTADO EN GOOGLE AI:", error.message);
    
    res.status(500).json({ 
      error: 'Error en el servidor al conectar con la IA',
      details: error.message 
    });
  }
});

// Ruta para manejar el Frontend (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor activo en puerto ${port}`);
});