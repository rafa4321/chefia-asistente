import React, { useState } from 'react';
import './index.css'; 

function App() {
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRecipe = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data && data.recipe) {
        setRecipe(data.recipe.replace(/[*#]/g, ""));
      }
    } catch (error) {
      setRecipe("Hubo un error al conectar con ChefIA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] font-sans">
      <div className="max-w-4xl mx-auto p-6">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-serif text-[#1A2E35] mb-2">ChefIA</h1>
          <p className="text-[#5B7078]">¿Qué cocinamos hoy?</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <textarea 
            className="w-full text-lg border-none focus:ring-0 placeholder-gray-300 resize-none"
            rows={4}
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe tus antojos o usa la cámara..."
          />
          <div className="flex justify-center mt-6">
            <button 
              onClick={generateRecipe} 
              disabled={loading}
              className="bg-[#FF5C00] hover:bg-[#E65300] text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg"
            >
              {loading ? 'Generando...' : 'Generar Receta'}
            </button>
          </div>
        </div>

        {recipe && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex border border-gray-100">
            <div className="w-2 bg-[#FF5C00]"></div> {/* La esencia: barra lateral naranja */}
            <div className="p-8 text-[#2C3E50] leading-relaxed whitespace-pre-wrap w-full">
              {recipe}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;