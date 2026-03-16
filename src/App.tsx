import React, { useState, useEffect } from 'react';

function App() {
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('chefia_prefs');
    return saved ? JSON.parse(saved) : { name: '', diet: [] };
  });

  useEffect(() => {
    localStorage.setItem('chefia_prefs', JSON.stringify(profile));
  }, [profile]);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe('');

    const dietContext = Array.isArray(profile.diet) ? profile.diet.join(', ') : '';

    try {
      // URL ABSOLUTA para asegurar comunicación total
      const res = await fetch('https://chefia-asistente.onrender.com/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, preferences: dietContext }),
      });
      
      if (!res.ok) throw new Error(`Error servidor: ${res.status}`);
      
      const data = await res.json();
      setRecipe(data.recipe);
    } catch (err) {
      setRecipe("Error: No se pudo conectar con el ChefIA. Revisa la conexión.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] text-[#1A2E35] pb-24">
      <main className="max-w-xl mx-auto px-6 pt-16">
        <h1 className="text-5xl font-serif italic text-center mb-12">ChefIA Pro</h1>
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl mb-8">
          <textarea 
            className="w-full border-none focus:ring-0 text-xl bg-transparent min-h-[120px]"
            placeholder="¿Qué tienes en la nevera?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <button 
          onClick={generate} 
          disabled={loading} 
          className="w-full bg-[#1A2E35] text-white py-6 rounded-full font-bold text-lg"
        >
          {loading ? 'Cocinando...' : 'Generar Receta'}
        </button>
        {recipe && (
          <div className="mt-12 font-serif text-lg leading-relaxed whitespace-pre-wrap">
            {recipe}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;