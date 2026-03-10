import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar perfil desde localStorage
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('chefia_user');
    return saved ? JSON.parse(saved) : { name: '', diet: [] as string[] };
  });

  useEffect(() => {
    localStorage.setItem('chefia_user', JSON.stringify(profile));
  }, [profile]);

  const diets = ['Vegano', 'Sin Gluten', 'Keto', 'Bajo en Sal'];

  const toggleDiet = (diet: string) => {
    setProfile({ ...profile, diet: profile.diet.includes(diet) 
      ? profile.diet.filter(d => d !== diet) 
      : [...profile.diet, diet] 
    });
  };

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe('');
    setImage('');

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          preferences: profile.diet.join(', ') 
        }),
      });
      const data = await res.json();
      setRecipe(data.recipe?.replace(/[*#]/g, ""));
      setImage(data.image);
    } catch (err) {
      setRecipe("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] pb-24 font-sans text-[#1A2E35]">
      {view === 'home' ? (
        <main className="max-w-xl mx-auto px-6 pt-12">
          <h1 className="text-5xl font-serif text-center mb-10">ChefIA Pro</h1>
          
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-orange-50">
            <textarea 
              className="w-full border-none focus:ring-0 text-xl placeholder-gray-300 resize-none"
              placeholder="¿Qué quieres cocinar?"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {profile.diet.map(d => (
                <span key={d} className="bg-orange-50 text-[#FF5C00] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{d}</span>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading} className="w-full bg-[#FF5C00] text-white py-5 rounded-2xl font-bold text-xl shadow-lg active:scale-95 transition-all disabled:bg-gray-300">
            {loading ? 'Cocinando ideas...' : 'Generar Receta'}
          </button>

          {recipe && (
            <div className="mt-10 bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
              {image && <img src={image} className="w-full h-64 object-cover" alt="Receta" />}
              <div className="p-8 whitespace-pre-wrap leading-relaxed">{recipe}</div>
            </div>
          )}
        </main>
      ) : (
        <main className="max-w-xl mx-auto px-8 pt-16">
          <h2 className="text-4xl font-serif mb-8 text-center">Tu Perfil</h2>
          <div className="bg-white p-6 rounded-3xl shadow-sm mb-6">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Nombre</label>
            <input 
              type="text" className="w-full text-xl border-none focus:ring-0 p-0" 
              placeholder="Escribe tu nombre..."
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {diets.map(d => (
              <button 
                key={d} onClick={() => toggleDiet(d)}
                className={`p-4 rounded-2xl font-bold text-sm border transition-all ${profile.diet.includes(d) ? 'bg-[#FF5C00] text-white' : 'bg-white text-gray-400 border-gray-100'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </main>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t p-4 flex justify-around">
        <button onClick={() => setView('home')} className={`flex flex-col items-center ${view === 'home' ? 'text-[#FF5C00]' : 'text-gray-300'}`}>
          <span className="text-2xl">🏠</span><span className="text-[10px] font-bold uppercase mt-1">Cocina</span>
        </button>
        <button onClick={() => setView('profile')} className={`flex flex-col items-center ${view === 'profile' ? 'text-[#FF5C00]' : 'text-gray-300'}`}>
          <span className="text-2xl">👤</span><span className="text-[10px] font-bold uppercase mt-1">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

export default App;