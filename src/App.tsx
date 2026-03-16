import React, { useState } from 'react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe('');

    try {
      // URL de producción en Render
      const res = await fetch('https://chefia-asistente.onrender.com/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt,
          preferences: "" // Aquí puedes añadir preferencias del perfil si lo deseas
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Error en el servidor");
      }
      
      setRecipe(data.recipe);
    } catch (err: any) {
      setRecipe(`Error de conexión: ${err.message}. Verifica que el servidor en Render esté 'Live'.`);
      console.error("Error en App:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] text-[#1A2E35] p-6 font-sans">
      <main className="max-w-xl mx-auto pt-10">
        <h1 className="text-5xl font-serif italic text-center mb-10">ChefIA Pro</h1>
        
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl mb-6">
          <textarea 
            className="w-full border-none focus:ring-0 text-xl bg-transparent min-h-[150px] outline-none"
            placeholder="¿Qué vamos a cocinar hoy?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <button 
          onClick={generate} 
          disabled={loading}
          className="w-full bg-[#1A2E35] text-white py-6 rounded-full font-bold text-xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Cocinando...' : 'Generar Receta'}
        </button>

        {recipe && (
          <div className="mt-12 p-8 bg-white rounded-3xl shadow-inner font-serif text-lg leading-relaxed whitespace-pre-wrap">
            {recipe}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;