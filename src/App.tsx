import React, { useState } from 'react';
// Cambiado de App.css a index.css según tu explorador de archivos
import './index.css'; 

function App() {
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRecipe = async () => {
    if (!prompt) return;
    setLoading(true);
    setRecipe(''); // Limpiamos pantalla antes de empezar

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      // VALIDACIÓN: Solo usamos replace si la receta llegó correctamente
      if (data && data.recipe) {
        const cleanRecipe = data.recipe.replace(/[*#]/g, '');
        setRecipe(cleanRecipe);
      } else {
        setRecipe("No se pudo obtener la receta. Revisa la consola para más detalles.");
      }
    } catch (error) {
      console.error("Error al generar receta:", error);
      setRecipe("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="max-w-2xl mx-auto text-center py-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">ChefIA</h1>
        <p className="text-gray-600 mb-8">¿Qué cocinamos hoy?</p>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <textarea 
            className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            rows={4}
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Receta rápida con pasta y tomate..."
          />
          <button 
            onClick={generateRecipe} 
            disabled={loading}
            className={`mt-4 w-full py-3 rounded-lg text-white font-semibold transition ${
              loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? 'Preparando...' : 'Generar con 1 Crédito'}
          </button>
        </div>

        {recipe && (
          <div className="mt-8 p-6 bg-white rounded-xl shadow-inner text-left whitespace-pre-wrap">
            {recipe}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;