import React, { useState, useEffect } from 'react';

function App() {
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  // Perfil con Persistencia
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('chefia_profile');
    return saved ? JSON.parse(saved) : { name: '', email: '', diet: [] as string[] };
  });

  useEffect(() => {
    localStorage.setItem('chefia_profile', JSON.stringify(profile));
  }, [profile]);

  const diets = ['Vegano', 'Sin Gluten', 'Keto', 'Bajo en Calorías'];

  const toggleDiet = (diet: string) => {
    setProfile({ ...profile, diet: profile.diet.includes(diet) 
      ? profile.diet.filter(d => d !== diet) 
      : [...profile.diet, diet] 
    });
  };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, preferences: profile.diet.join(', ') }),
      });
      const data = await res.json();
      setRecipe(data.recipe);
      setImage(data.image);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] text-[#1A2E35] pb-24 font-sans">
      {view === 'home' ? (
        <main className="max-w-xl mx-auto px-6 pt-12">
          <header className="mb-10 text-center">
            <h1 className="text-5xl font-serif mb-2">ChefIA Pro</h1>
            <p className="opacity-60 italic">¿Qué cocinamos hoy, {profile.name || 'Rafael'}?</p>
          </header>

          <div className="bg-white rounded-[2rem] shadow-xl p-6 mb-6 border border-orange-50">
            <textarea 
              className="w-full border-none focus:ring-0 text-xl placeholder-gray-300 resize-none"
              placeholder="Ej: Chivito uruguayo gourmet..."
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className="flex gap-3 mt-4">
              <button className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold text-gray-500">
                <span>➕</span> Subir foto
              </button>
              <button className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold text-gray-500">
                <span>📷</span> Cámara
              </button>
            </div>
          </div>

          <button 
            onClick={generate}
            className="w-full bg-[#FF5C00] text-white py-5 rounded-2xl font-bold text-xl shadow-lg active:scale-95 transition-all"
          >
            {loading ? 'Generando...' : 'Generar con 1 Crédito'}
          </button>

          {recipe && (
            <div className="mt-10 bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in border border-gray-100">
              {image && <img src={image} className="w-full h-64 object-cover" />}
              <div className="p-8 whitespace-pre-wrap leading-relaxed">
                {recipe}
              </div>
            </div>
          )}
        </main>
      ) : (
        <main className="max-w-xl mx-auto px-8 pt-16">
          <h2 className="text-4xl font-serif mb-8 text-center">Tu Perfil</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</label>
              <input 
                type="text" className="w-full text-xl mt-1 border-none focus:ring-0 p-0"
                value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">Preferencias</label>
              <div className="grid grid-cols-2 gap-3">
                {diets.map(d => (
                  <button 
                    key={d} onClick={() => toggleDiet(d)}
                    className={`p-4 rounded-2xl font-bold text-sm border transition-all ${profile.diet.includes(d) ? 'bg-[#FF5C00] text-white border-[#FF5C00]' : 'bg-white text-gray-400 border-gray-100'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Navegación Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t p-4 flex justify-around items-center z-50">
        <button onClick={() => setView('home')} className={`flex flex-col items-center ${view === 'home' ? 'text-[#FF5C00]' : 'text-gray-300'}`}>
          <span className="text-2xl">🏠</span>
          <span className="text-[10px] font-bold mt-1 uppercase">Inicio</span>
        </button>
        <button onClick={() => setView('profile')} className={`flex flex-col items-center ${view === 'profile' ? 'text-[#FF5C00]' : 'text-gray-300'}`}>
          <span className="text-2xl">👤</span>
          <span className="text-[10px] font-bold mt-1 uppercase">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

export default App;