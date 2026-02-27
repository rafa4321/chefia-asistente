import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt, language, imageData } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const parts = [{ text: `Receta en ${language}: ${prompt}` }];
    if (imageData) parts.push({ inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } });

    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    res.json({ text: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));