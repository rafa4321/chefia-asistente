import React, { useState, useEffect } from 'react';

function App() {
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [image, setImage] = useState('');
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
    setImage('');

    const dietContext = Array.isArray(profile.diet) ? profile.diet.join(', ') : '';

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, preferences: dietContext }),
      });
      const data = await res.json();
      setRecipe(data.recipe);
      if (data.image) setImage(data.image);
    } catch (err) {
      setRecipe("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] text-[#1A2E35] pb-24">
      {view === 'home' ? (
        <main className="max-w-xl mx-auto px-6 pt-16">
          <h1 className="text-5xl font-serif italic text-center mb-12">ChefIA Pro</h1>
          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl mb-8">
            <h2 className="text-2xl font-serif mb-4">{profile.name ? `Chef ${profile.name}` : '¿Qué cocinamos?'}</h2>
            <textarea 
              className="w-full border-none focus:ring-0 text-xl bg-transparent min-h-[120px]"
              placeholder="Ingredientes..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <button onClick={generate} disabled={loading} className="w-full bg-[#1A2E35] text-white py-6 rounded-full font-bold text-lg">
            {loading ? 'Cocinando...' : 'Generar Receta'}
          </button>
          {recipe && (
            <div className="mt-12">
              {image && <img src={image} className="w-full rounded-[2rem] shadow-lg mb-8" alt="Plato" />}
              <div className="font-serif text-lg leading-relaxed whitespace-pre-wrap">{recipe}</div>
            </div>
          )}
        </main>
      ) : (
        <main className="max-w-xl mx-auto px-10 pt-20">
          <h2 className="text-3xl font-serif mb-8">Perfil</h2>
          <input 
            className="w-full p-4 rounded-2xl border-none shadow-inner mb-4"
            placeholder="Nombre..."
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
          />
        </main>
      )}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1A2E35] px-10 py-4 rounded-full flex gap-12 text-white shadow-2xl">
        <button onClick={() => setView('home')}>🍽️</button>
        <button onClick={() => setView('profile')}>👤</button>
      </nav>
    </div>
  );
}

export default App;