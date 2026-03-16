import React, { useState, useEffect } from 'react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar preferencias guardadas
  const [profile] = useState(() => {
    const saved = localStorage.getItem('chefia_prefs');
    return saved ? JSON.parse(saved) : { name: '', diet: [] };
  });

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe('');

    try {
      // Conexión directa a tu URL de Render
      const res = await fetch('https://chefia-asistente.onrender.com/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt, 
          preferences: profile.diet.join(', ') 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Error desconocido");
      
      setRecipe(data.recipe);
    } catch (err: any) {
      setRecipe(`Lo siento, hubo un problema: ${err.message}`);
      console.error("Error en Front:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] text-[#1A2E35] p-6">
      <main className="max-w-xl mx-auto pt-10">
        <h1 className="text-5xl font-serif italic text-center mb-10">ChefIA Pro</h1>
        
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl mb-6">
          <textarea 
            className="w-full border-none focus:ring-0 text-xl bg-transparent min-h-[150px]"
            placeholder="Escribe los ingredientes aquí..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <button 
          onClick={generate} 
          disabled={loading}
          className="w-full bg-[#1A2E35] text-white py-6 rounded-full font-bold text-xl shadow-lg active:scale-95 transition-transform"
        >
          {loading ? 'Cocinando...' : 'Generar Receta'}
        </button>

        {recipe && (
          <div className="mt-12 p-6 bg-white rounded-3xl shadow-inner font-serif text-lg leading-relaxed whitespace-pre-wrap">
            {recipe}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;