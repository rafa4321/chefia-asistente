import React, { useState } from 'react';
import './index.css';

function App() {
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [recipeImage, setRecipeImage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estado de Perfil Universal
  const [profile, setProfile] = useState({
    name: '',
    diet: [] as string[]
  });

  const dietOptions = ['Vegano', 'Sin Gluten', 'Keto', 'Bajo en Sal', 'Sin Lácteos'];

  const toggleDiet = (diet: string) => {
    setProfile(prev => ({
      ...prev,
      diet: prev.diet.includes(diet) ? prev.diet.filter(d => d !== diet) : [...prev.diet, diet]
    }));
  };

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe('');
    setRecipeImage('');

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
      if (data.recipe) setRecipe(data.recipe.replace(/[*#]/g, ""));
      if (data.image) setRecipeImage(data.image);
    } catch (err) {
      setRecipe("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] pb-24 font-sans text-[#1A2E35]">
      
      {view === 'home' ? (
        <main className="max-w-2xl mx-auto px-4 pt-10">
          <header className="text-center mb-10">
            <h1 className="text-5xl font-serif mb-2">ChefIA Pro</h1>
            <p className="text-gray-500 italic">Cocina inteligente para {profile.name || 'todos'}</p>
          </header>

          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 flex flex-col gap-4 border border-orange-50">
            <div className="flex gap-4 items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border flex-shrink-0">
                {recipeImage ? <img src={recipeImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🥘</div>}
              </div>
              <textarea 
                className="flex-1 border-none focus:ring-0 text-lg resize-none placeholder-gray-300"
                placeholder="¿Qué quieres cocinar?"
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {profile.diet.map(d => (
                <span key={d} className="bg-orange-50 text-[#FF5C00] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {d}
                </span>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading} className="w-full bg-[#FF5C00] text-white py-4 rounded-2xl font-bold text-xl shadow-lg active:scale-95 disabled:bg-gray-300 transition-all">
            {loading ? 'Generando...' : 'Crear Receta'}
          </button>

          {recipe && (
            <div className="mt-8 bg-white rounded-3xl shadow-2xl overflow-hidden flex border border-gray-100 animate-fade-in">
              <div className="w-2 bg-[#FF5C00]"></div>
              <div className="p-8 whitespace-pre-wrap text-gray-700 leading-relaxed w-full">
                {recipe}
              </div>
            </div>
          )}
        </main>
      ) : (
        <main className="max-w-2xl mx-auto px-6 pt-16 animate-fade-in">
          <h2 className="text-4xl font-serif mb-8">Tu Perfil</h2>
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Nombre de Usuario</label>
              <input 
                type="text" 
                className="w-full text-xl border-none focus:ring-0 p-0"
                placeholder="Tu nombre aquí..."
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Restricciones Alimentarias</label>
              <div className="grid grid-cols-2 gap-3">
                {dietOptions.map(d => (
                  <button 
                    key={d}
                    onClick={() => toggleDiet(d)}
                    className={`p-4 rounded-2xl font-bold text-sm transition-all border ${profile.diet.includes(d) ? 'bg-[#FF5C00] text-white border-[#FF5C00]' : 'bg-white text-gray-400 border-gray-100'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Barra de Navegación */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t p-4 flex justify-around items-center z-50">
        <button onClick={() => setView('home')} className={`flex flex-col items-center ${view === 'home' ? 'text-[#FF5C00]' : 'text-gray-300'}`}>
          <span className="text-2xl">🏠</span>
          <span className="text-[10px] font-bold uppercase mt-1">Cocina</span>
        </button>
        <button onClick={() => setView('profile')} className={`flex flex-col items-center ${view === 'profile' ? 'text-[#FF5C00]' : 'text-gray-300'}`}>
          <span className="text-2xl">👤</span>
          <span className="text-[10px] font-bold uppercase mt-1">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

export default App;