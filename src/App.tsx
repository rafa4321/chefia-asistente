import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  // Perfil con inicialización segura para evitar errores de .join()
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('chefia_pro_vfinal');
    return saved ? JSON.parse(saved) : { name: '', diet: [] as string[] };
  });

  useEffect(() => {
    localStorage.setItem('chefia_pro_vfinal', JSON.stringify(profile));
  }, [profile]);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe('');
    setImage('');

    // Corrección del error JOIN
    const dietStr = Array.isArray(profile?.diet) ? profile.diet.join(', ') : '';

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, preferences: dietStr }),
      });
      const data = await res.json();
      setRecipe(data.recipe?.replace(/[*#]/g, ""));
      if (data.image) setImage(data.image);
    } catch (err) {
      setRecipe("Hubo un problema al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] text-[#1A2E35] pb-32">
      {view === 'home' ? (
        <main className="max-w-xl mx-auto px-6 pt-12 animate-fade-in">
          <header className="text-center mb-10">
            <h1 className="text-5xl font-serif tracking-tight">ChefIA Pro</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mt-2 font-bold">Estética & Sabor</p>
          </header>

          <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] p-8 shadow-2xl border border-white mb-8">
            <h2 className="text-2xl font-serif mb-4 leading-tight">¿Qué cocinamos hoy, {profile.name || 'Rafael'}?</h2>
            <textarea 
              className="w-full border-none focus:ring-0 text-xl bg-transparent placeholder-gray-300 resize-none min-h-[120px]"
              placeholder="Ej: Trucha de los Andes con costra de quinua..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap mt-2">
              {profile.diet.map((d: string) => (
                <span key={d} className="bg-[#918151]/10 text-[#918151] px-3 py-1 rounded-full text-[10px] font-bold uppercase">{d}</span>
              ))}
            </div>
          </div>

          <button 
            onClick={generate}
            className="w-full bg-[#918151] text-white py-6 rounded-[2rem] font-bold text-lg shadow-xl active:scale-95 transition-all"
          >
            {loading ? 'Sublimando...' : 'Generar Receta Gourmet'}
          </button>

          {recipe && (
            <div className="mt-12 animate-slide-up">
              {image && <img src={image} className="w-full h-80 object-cover rounded-[3rem] shadow-2xl mb-8 border-4 border-white" />}
              <div className="px-2 font-serif text-xl leading-relaxed text-gray-800 whitespace-pre-wrap">
                {recipe}
              </div>
            </div>
          )}
        </main>
      ) : (
        <main className="max-w-xl mx-auto px-10 pt-20 animate-fade-in">
          <h2 className="text-4xl font-serif mb-10">Preferencias</h2>
          <div className="bg-white p-6 rounded-3xl shadow-sm mb-6">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Nombre Maestro</label>
            <input 
              type="text" className="w-full text-2xl border-none focus:ring-0 p-0 font-serif"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Vegano', 'Sin Gluten', 'Keto', 'Sin Sal'].map(d => (
              <button 
                key={d}
                onClick={() => {
                  const diet = profile.diet.includes(d) ? profile.diet.filter((x: string) => x !== d) : [...profile.diet, d];
                  setProfile({...profile, diet});
                }}
                className={`p-5 rounded-3xl font-bold text-xs transition-all border ${profile.diet.includes(d) ? 'bg-[#918151] text-white border-[#918151]' : 'bg-white text-gray-400 border-gray-100'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </main>
      )}

      {/* Navegación Flotante Gourmet */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-10 py-5 rounded-full shadow-2xl border border-white/50 flex gap-12 z-50">
        <button onClick={() => setView('home')} className={`text-2xl ${view === 'home' ? 'text-[#918151]' : 'text-gray-300'}`}>🏠</button>
        <button onClick={() => setView('profile')} className={`text-2xl ${view === 'profile' ? 'text-[#918151]' : 'text-gray-300'}`}>👤</button>
      </nav>
    </div>
  );
}

export default App;