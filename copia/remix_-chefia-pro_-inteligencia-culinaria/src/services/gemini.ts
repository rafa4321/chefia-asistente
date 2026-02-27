import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: string;
  calories?: string;
  dietaryTags: string[];
}

export const generateRecipe = async (
  prompt: string,
  language: string = "es",
  imageData?: string,
  userProfile?: { region: string, preferences: string[] }
): Promise<{ recipe: Recipe; imageUrl: string }> => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `Eres un chef experto de clase mundial. Generas recetas detalladas, creativas y precisas. 
  Responde siempre en el idioma: ${language === "es" ? "Español" : "Inglés"}.
  ${userProfile ? `Contexto del usuario: Región ${userProfile.region}, Preferencias: ${userProfile.preferences.join(', ')}.` : ''}
  Si se proporciona una imagen, analiza los ingredientes visibles y úsalos.
  Asegúrate de que la receta respete las restricciones dietéticas mencionadas y las preferencias del usuario.`;

  const response = await ai.models.generateContent({
    model,
    contents: imageData 
      ? { parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } }] }
      : prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          prepTime: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          calories: { type: Type.STRING },
          dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["title", "description", "ingredients", "instructions", "prepTime", "difficulty", "dietaryTags"],
      },
    },
  });

  let recipe: Recipe;
  try {
    const text = response.text || "{}";
    const cleanJson = text.replace(/```json\n?|```/g, "").trim();
    recipe = JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse recipe JSON:", e);
    throw new Error("La respuesta del chef no fue válida. Por favor, intenta de nuevo.");
  }

  // Generate image for the recipe
  let imageUrl = "https://picsum.photos/seed/food/1200/800";
  try {
    const imageResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `A professional, high-end food photography of ${recipe.title}. Vibrant colors, gourmet presentation, soft lighting, shallow depth of field, 4k resolution.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  } catch (e) {
    console.error("Image generation failed, using placeholder:", e);
  }

  return { recipe, imageUrl };
};
