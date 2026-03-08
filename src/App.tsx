import React, { useState } from 'react';
import './index.css'; 

function App() {
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRecipe = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe(''); 

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data && data.recipe) {
        // Limpieza de símbolos manteniendo la estructura
        const cleanRecipe = data.recipe.replace(/[*#]/g, '');
        setRecipe(cleanRecipe);
      } else {
        setRecipe("Lo siento Rafael, no pude generar la receta. Inténtalo de nuevo.");
      }
    } catch (error) {
      setRecipe("Hubo un error de comunicación con el servidor culinario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <header className="max-w-3xl mx-auto text-center py-10">
        <h1 className="text-5xl font-bold text-orange-800 mb-2">ChefIA</h1>
        <p className="text-orange-600 text-xl mb-8">Tu Asistente Culinario Personal</p>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
          <textarea 
            className="w-full p-4 border-2 border-orange-50 rounded-xl focus:border-orange-500 outline-none text-gray-700"
            rows={4}
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="¿Qué ingredientes tienes o qué receta buscas? (Ej: Receta de alfajores de maicena)"
          />
          <button 
            onClick={generateRecipe} 
            disabled={loading}
            className={`mt-4 w-full py-4 rounded-xl text-white font-bold text-lg shadow-md transition ${
              loading ? 'bg-orange-300' : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? 'Preparando receta...' : 'Generar Receta'}
          </button>
        </div>

        {recipe && (
          <div className="mt-8 p-8 bg-white rounded-2xl shadow-md text-left border-l-8 border-orange-500">
            <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
              {recipe}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;