import React, { useState } from 'react';
import './index.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [recipeImage, setRecipeImage] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRecipe = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe('');
    setRecipeImage('');

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (data && data.recipe) {
        // Limpieza de formato para presentación limpia
        setRecipe(data.recipe.replace(/[*#]/g, ""));
      }
      
      if (data && data.image) {
        setRecipeImage(data.image);
      }
    } catch (error) {
      setRecipe("Lo siento, no se pudo conectar con el servicio de ChefIA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] font-sans pb-24">
      <header className="text-center py-12">
        <h1 className="text-5xl font-serif text-[#1A2E35] mb-2 tracking-tight">ChefIA Pro</h1>
        <p className="text-[#5B7078] italic text-lg tracking-wide">Inteligencia Culinaria para Todos</p>
      </header>

      <main className="max-w-3xl mx-auto px-4">
        {/* Sección de Entrada e Imagen */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-center border border-orange-50">
          <div className="w-40 h-40 bg-gray-50 rounded-2xl overflow-hidden border-2 border-orange-100 flex-shrink-0 shadow-inner flex items-center justify-center">
            {recipeImage ? (
              <img src={recipeImage} className="w-full h-full object-cover animate-fade-in" alt="Platillo" />
            ) : (
              <span className="text-4xl">🥘</span>
            )}
          </div>
          <textarea 
            className="flex-1 w-full text-xl border-none focus:ring-0 placeholder-gray-300 resize-none bg-transparent"
            placeholder="¿Qué platillo gourmet quieres crear hoy?"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <button 
          onClick={generateRecipe} 
          disabled={loading}
          className="w-full bg-[#FF5C00] text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-[#E65300] transition-all transform hover:scale-[1.01] active:scale-95 disabled:bg-gray-300"
        >
          {loading ? 'Cocinando ideas...' : 'Generar Receta'}
        </button>

        {/* Tarjeta de Receta con Esencia Naranja */}
        {recipe && (
          <div className="mt-12 bg-white rounded-3xl shadow-2xl overflow-hidden flex border border-gray-100 animate-fade-in">
            <div className="w-3 bg-[#FF5C00]"></div>
            <div className="p-10 text-[#2C3E50] leading-relaxed whitespace-pre-wrap w-full text-lg">
              {recipe}
            </div>
          </div>
        )}
      </main>

      {/* Navegación Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-5 flex justify-around items-center z-50 shadow-2xl">
        <button className="flex flex-col items-center text-[#FF5C00] font-bold">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] uppercase tracking-widest mt-1">Inicio</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <span className="text-xl">📖</span>
          <span className="text-[10px] uppercase tracking-widest mt-1">Recetas</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <span className="text-xl">👤</span>
          <span className="text-[10px] uppercase tracking-widest mt-1">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

export default App;