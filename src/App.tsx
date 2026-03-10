import React, { useState } from 'react';
import './index.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [recipeImage, setRecipeImage] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe('');
    setRecipeImage('');

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      
      // Verificación de seguridad antes del replace
      if (data && data.recipe) {
        setRecipe(data.recipe.replace(/[*#]/g, ""));
      }
      if (data && data.image) {
        setRecipeImage(data.image);
      }
    } catch (err) {
      console.error(err);
      setRecipe("Lo siento , hubo un problema técnico. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] pb-24 font-sans">
      <header className="text-center py-12">
        <h1 className="text-5xl font-serif text-[#1A2E35] mb-2 tracking-tight">ChefIA Pro</h1>
        <p className="text-[#5B7078] italic text-lg">Inteligencia Culinaria para Rafael</p>
      </header>

      <main className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-center border border-orange-50">
          <div className="w-48 h-48 bg-gray-50 rounded-2xl overflow-hidden border-2 border-orange-100 flex-shrink-0 shadow-inner">
            {recipeImage ? (
              <img src={recipeImage} className="w-full h-full object-cover animate-fade-in" alt="Receta" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-orange-200 text-5xl">👨‍🍳</div>
            )}
          </div>
          <textarea 
            className="flex-1 w-full text-xl border-none focus:ring-0 placeholder-gray-300 resize-none bg-transparent"
            placeholder="¿Qué platillo gourmet diseñamos hoy?"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <button 
          onClick={generate}
          disabled={loading}
          className="w-full bg-[#FF5C00] text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-[#E65300] transition-all transform hover:scale-[1.01] active:scale-95 disabled:bg-gray-300"
        >
          {loading ? 'Creando Obra Maestra...' : 'Generar Receta Pro'}
        </button>

        {recipe && (
          <div className="mt-12 bg-white rounded-3xl shadow-2xl overflow-hidden flex border border-gray-100">
            <div className="w-3 bg-[#FF5C00]"></div>
            <div className="p-10 text-[#2C3E50] leading-relaxed whitespace-pre-wrap w-full text-lg">
              {recipe}
            </div>
          </div>
        )}
      </main>

      {/* Navegación Inferior Estética */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-5 flex justify-around items-center z-50">
        <button className="flex flex-col items-center text-[#FF5C00] font-bold"><span>🏠</span><span className="text-xs">Inicio</span></button>
        <button className="flex flex-col items-center text-gray-400"><span>📖</span><span className="text-xs">Recetas</span></button>
        <button className="flex flex-col items-center text-gray-400"><span>👤</span><span className="text-xs">Perfil</span></button>
      </nav>
    </div>
  );
}

export default App;