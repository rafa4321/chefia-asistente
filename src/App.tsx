import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('chefia_user_pref');
    return saved ? JSON.parse(saved) : { name: '', diet: [] };
  });

  useEffect(() => {
    localStorage.setItem('chefia_user_pref', JSON.stringify(profile));
  }, [profile]);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe('');
    setImage('');

    const dietContext = (profile && Array.isArray(profile.diet)) ? profile.diet.join(', ') : '';

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
      setRecipe("Error de conexión con el servicio. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] text-[#1A2E35] pb-32">
      {view === 'home' ? (
        <main className="max-w-xl mx-auto px-6 pt-16">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-serif italic mb-2">ChefIA Pro</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Arquitectura Gastronómica</p>
          </header>

          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white mb-8">
            <h2 className="text-2xl font-serif mb-6 leading-tight">
              {profile.name ? `Bienvenido, Chef ${profile.name}` : '¿Qué crearemos hoy?'}
            </h2>
            <textarea 
              className="w-full border-none focus:ring-0 text-xl bg-transparent placeholder-gray-300 resize-none min-h-[140px]"
              placeholder="Ingresa ingredientes o el nombre del plato..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <button 
            onClick={generate}
            className="w-full bg-[#1A2E35] text-white py-6 rounded-[2rem] font-bold text-lg shadow-2xl active:scale-95 transition-all"
          >
            {loading ? 'Generando Experiencia...' : 'Elevar Receta'}
          </button>

          {recipe && (
            <div className="mt-12">
              {image && (
                <img src={image} className="w-full h-96 object-cover rounded-[3rem] shadow-2xl mb-10 border-4 border-white" alt="Plato" />
              )}
              <div className="font-serif text-xl leading-relaxed whitespace-pre-wrap px-2">
                {recipe}
              </div>
            </div>
          )}
        </main>
      ) : (
        <main className="max-w-xl mx-auto px-10 pt-24">
          <h2 className="text-4xl font-serif mb-12 italic">Perfil Gourmet</h2>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm mb-10 border border-gray-50">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Nombre</label>
            <input 
              type="text" className="w-full text-2xl border-none focus:ring-0 p-0 font-serif"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
            />
          </div>
        </main>
      )}

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1A2E35]/90 px-10 py-5 rounded-full shadow-2xl flex gap-14 z-50 border border-white/10">
        <button onClick={() => setView('home')} className="text-2xl">🍽️</button>
        <button onClick={() => setView('profile')} className="text-2xl">👤</button>
      </nav>
    </div>
  );
}

export default App;