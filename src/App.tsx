import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  // Inicialización segura del perfil para evitar errores de renderizado
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('chefia_pro_master');
    return saved ? JSON.parse(saved) : { name: '', diet: [] };
  });

  // Guardar cambios en el perfil automáticamente
  useEffect(() => {
    localStorage.setItem('chefia_pro_master', JSON.stringify(profile));
  }, [profile]);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe('');
    setImage('');

    // PROTECCIÓN: Verificamos que diet sea un array antes de usar join
    const dietContext = (profile && Array.isArray(profile.diet)) 
      ? profile.diet.join(', ') 
      : '';

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          preferences: dietContext 
        }),
      });

      if (!res.ok) throw new Error('Error en la comunicación con el chef');
      
      const data = await res.json();
      setRecipe(data.recipe);
      if (data.image) setImage(data.image);
    } catch (err) {
      setRecipe("Lo siento, Rafael. Hubo un problema al conectar con la cocina central. Verifica tu API Key en Render.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDiet = (diet: string) => {
    const currentDiets = Array.isArray(profile.diet) ? profile.diet : [];
    const newDiets = currentDiets.includes(diet)
      ? currentDiets.filter((d: string) => d !== diet)
      : [...currentDiets, diet];
    setProfile({ ...profile, diet: newDiets });
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] text-[#1A2E35] pb-32 selection:bg-[#918151]/20">
      
      {view === 'home' ? (
        <main className="max-w-xl mx-auto px-6 pt-16 animate-gourmet">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-serif tracking-tight mb-2 italic">ChefIA Pro</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Arquitectura Gastronómica</p>
          </header>

          {/* Tarjeta de Entrada de Usuario */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/50 mb-8 transition-all hover:shadow-orange-900/5">
            <h2 className="text-2xl font-serif mb-6 leading-tight">
              {profile.name ? `¿Qué crearemos hoy, ${profile.name}?` : '¿Cuál es tu antojo hoy?'}
            </h2>
            <textarea 
              className="w-full border-none focus:ring-0 text-xl bg-transparent placeholder-gray-300 resize-none min-h-[140px]"
              placeholder="Describe ingredientes o una idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex gap-2 mt-4 flex-wrap">
              {Array.isArray(profile.diet) && profile.diet.map((d: string) => (
                <span key={d} className="bg-[#918151]/10 text-[#918151] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#918151]/20">
                  {d}
                </span>
              ))}
            </div>
          </div>

          <button 
            onClick={generate}
            disabled={loading}
            className="w-full bg-[#1A2E35] text-white py-6 rounded-[2rem] font-bold text-lg shadow-2xl active:scale-95 transition-all disabled:opacity-50 hover:bg-[#253f48]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-pulse">Cocinando Experiencia...</span>
              </span>
            ) : 'Elevar mi Cocina'}
          </button>

          {/* Resultado de la Receta */}
          {recipe && (
            <section className="mt-12 animate-gourmet">
              {image && (
                <img src={image} className="w-full h-[450px] object-cover rounded-[3rem] shadow-2xl mb-10 border-4 border-white" alt="Emplatado Gourmet" />
              )}
              <div className="px-4">
                <div className="w-16 h-1 bg-[#918151] mb-10 rounded-full"></div>
                <div className="font-serif text-xl leading-relaxed text-gray-800 whitespace-pre-wrap selection:bg-orange-100">
                  {recipe}
                </div>
              </div>
            </section>
          )}
        </main>
      ) : (
        /* Pantalla de Perfil Gourmet */
        <main className="max-w-xl mx-auto px-10 pt-24 animate-gourmet">
          <h2 className="text-4xl font-serif mb-12 italic">Tu Perfil</h2>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm mb-10 border border-gray-50">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Nombre del Chef</label>
            <input 
              type="text" 
              className="w-full text-2xl border-none focus:ring-0 p-0 font-serif placeholder-gray-200"
              placeholder="Escribe tu nombre..."
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
            />
          </div>
          
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 px-4">Restricciones Dietéticas</h3>
          <div className="grid grid-cols-2 gap-4">
            {['Vegano', 'Sin Gluten', 'Keto', 'Bajo en Sal', 'Sin Lácteos', 'Paleo'].map(d => (
              <button 
                key={d}
                onClick={() => toggleDiet(d)}
                className={`p-6 rounded-[2rem] font-bold text-xs transition-all border ${
                  Array.isArray(profile.diet) && profile.diet.includes(d) 
                  ? 'bg-[#918151] text-white border-[#918151] shadow-lg scale-[1.02]' 
                  : 'bg-white text-gray-400 border-gray-100'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </main>
      )}

      {/* Navegación Flotante Minimalista */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1A2E35]/90 backdrop-blur-2xl px-10 py-5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex gap-14 z-50 border border-white/10">
        <button onClick={() => setView('home')} className={`transition-all ${view === 'home' ? 'text-white scale-125' : 'text-gray-500 hover:text-gray-300'}`}>
          <span className="text-2xl">🍽️</span>
        </button>
        <button onClick={() => setView('profile')} className={`transition-all ${view === 'profile' ? 'text-white scale-125' : 'text-gray-500 hover:text-gray-300'}`}>
          <span className="text-2xl">👤</span>
        </button>
      </nav>
    </div>
  );
}

export default App;