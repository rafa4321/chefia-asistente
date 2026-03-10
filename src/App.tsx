import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  // Inicialización segura del perfil
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('chefia_pro_v2');
    return saved ? JSON.parse(saved) : { name: '', diet: [] };
  });

  useEffect(() => {
    localStorage.setItem('chefia_pro_v2', JSON.stringify(profile));
  }, [profile]);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe('');
    setImage('');

    // CORRECCIÓN: Asegura que diet sea un array antes del join
    const preferences = Array.isArray(profile?.diet) ? profile.diet.join(', ') : '';

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, preferences }),
      });
      const data = await res.json();
      setRecipe(data.recipe);
      setImage(data.image);
    } catch (err) {
      setRecipe("Error de conexión. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] text-[#1A2E35]">
      <main className="max-w-xl mx-auto px-6 pt-12 animate-gourmet">
        <h1 className="text-5xl font-serif text-center mb-10">ChefIA Pro</h1>
        
        {view === 'home' ? (
          <>
            <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl border border-white">
              <h2 className="text-2xl font-serif mb-4">¿Qué crearemos hoy, {profile.name || 'Rafael'}?</h2>
              <textarea 
                className="w-full border-none focus:ring-0 text-xl bg-transparent placeholder-gray-300 min-h-[120px]"
                placeholder="Ej: Trucha de los Andes..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <button 
              onClick={generate}
              disabled={loading}
              className="w-full mt-6 bg-[#918151] text-white py-6 rounded-full font-bold text-lg shadow-xl active:scale-95 transition-all"
            >
              {loading ? 'Sublimando Sabores...' : 'Generar Receta Gourmet'}
            </button>
            {recipe && (
              <div className="mt-12">
                {image && <img src={image} className="w-full h-80 object-cover rounded-[3rem] shadow-2xl mb-8" alt="Plato" />}
                <div className="font-serif text-xl leading-relaxed whitespace-pre-wrap">{recipe}</div>
              </div>
            )}
          </>
        ) : (
          /* Aquí iría el componente de Perfil simplificado */
          <div className="pt-10">
            <h2 className="text-3xl font-serif mb-6">Preferencias</h2>
            <input 
              className="w-full p-4 rounded-2xl border-none shadow-inner"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              placeholder="Tu nombre..."
            />
          </div>
        )}
      </main>
      
      {/* Navegación Flotante */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 px-8 py-4 rounded-full shadow-2xl flex gap-12 border border-white">
        <button onClick={() => setView('home')} className="text-2xl">🏠</button>
        <button onClick={() => setView('profile')} className="text-2xl">👤</button>
      </nav>
    </div>
  );
}

export default App;