import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 10000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const gourmetFallbacks = {
  pollo: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=1000",
  carne: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?auto=format&fit=crop&q=80&w=1000",
  pescado: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=1000",
  vegetal: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1000",
  postre: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=1000",
  default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000"
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-recipe', async (req, res) => {
  const { prompt, preferences } = req.body;
  
  try {
    // 1. Generar Texto (Gemini 1.5 Flash)
    const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const textResult = await textModel.generateContent(`Actúa como ChefIA Pro. Genera una receta gourmet para: ${prompt}. Dieta: ${preferences}.`);
    const recipeText = textResult.response.text();

    // 2. Generar Imagen (Imagen 3) con Fallback
    let imageUrl = null;
    try {
      const imgModel = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });
      const imgResult = await imgModel.generateContent(`Gourmet photography of ${prompt}, professional lighting.`);
      
      if (imgResult.response && imgResult.response.candidates[0].content.parts[0].inlineData) {
        imageUrl = `data:image/png;base64,${imgResult.response.candidates[0].content.parts[0].inlineData.data}`;
      }
    } catch (e) {
      console.log("⚠️ Usando imagen de respaldo por límite de cuota.");
      const p = prompt.toLowerCase();
      if (p.includes("pollo")) imageUrl = gourmetFallbacks.pollo;
      else if (p.includes("carne")) imageUrl = gourmetFallbacks.carne;
      else if (p.includes("pescado")) imageUrl = gourmetFallbacks.pescado;
      else if (p.includes("postre")) imageUrl = gourmetFallbacks.postre;
      else imageUrl = gourmetFallbacks.default;
    }

    res.json({ recipe: recipeText, image: imageUrl });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.listen(port, () => console.log("Servidor ChefIA Pro Activo"));