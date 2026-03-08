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
    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.recipe) setRecipe(data.recipe.replace(/[*#]/g, ""));
      if (data.image) setRecipeImage(data.image);
    } catch (err) {
      setRecipe("Error al conectar con ChefIA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] pb-20">
      <header className="text-center py-10">
        <h1 className="text-4xl font-serif text-[#1A2E35]">ChefIA</h1>
        <p className="text-gray-500">¿Qué cocinamos hoy, Rafael?</p>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex gap-4 items-center">
          {/* FOTO DE PERFIL / RECETA */}
          <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
            {recipeImage ? <img src={recipeImage} className="w-full h-full object-cover" /> : <span className="m-auto text-2xl">👨‍🍳</span>}
          </div>
          <textarea 
            className="flex-1 border-none focus:ring-0 text-lg resize-none"
            placeholder="Describe tus antojos..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <button 
          onClick={generate}
          disabled={loading}
          className="w-full bg-[#FF5C00] text-white py-4 rounded-xl font-bold text-lg mb-8 shadow-lg hover:bg-[#E65300]"
        >
          {loading ? 'Generando Magia...' : 'Generar Receta'}
        </button>

        {recipe && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex border border-gray-100 animate-fade-in">
            <div className="w-2 bg-[#FF5C00]"></div> {/* La barra lateral naranja esencial */}
            <div className="p-8 whitespace-pre-wrap text-gray-700 w-full">
              {recipe}
            </div>
          </div>
        )}
      </main>

      {/* Navegación inferior restaurada */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around text-gray-400">
        <button className="text-[#FF5C00]">🏠<br/><span className="text-xs">Inicio</span></button>
        <button>📖<br/><span className="text-xs">Recetas</span></button>
        <button>👤<br/><span className="text-xs">Perfil</span></button>
      </nav>
    </div>
  );
}

export default App;