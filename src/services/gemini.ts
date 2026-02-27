export const generateRecipe = async (prompt: string, language: string = "es", imageData?: string) => {
  const response = await fetch('/api/generate-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, language, imageData })
  });

  if (!response.ok) throw new Error("Error en el servidor");
  const data = await response.json();
  const cleanJson = data.text.replace(/```json\n?|```/g, "").trim();
  return { recipe: JSON.parse(cleanJson), imageUrl: "https://picsum.photos/seed/food/800/600" };
};