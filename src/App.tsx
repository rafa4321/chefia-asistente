import React, { useState } from 'react';
import './App.css';

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

      // SOLUCIÓN AL ERROR: Validar si data.recipe existe antes de limpiar el texto
      if (data && data.recipe) {
        // Quitamos los asteriscos y formateamos el texto
        const cleanRecipe = data.recipe.replace(/[*#]/g, '');
        setRecipe(cleanRecipe);
      } else {
        setRecipe("No se pudo obtener la receta. Por favor, intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error:", error);
      setRecipe("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ChefIA - Tu Asistente Culinario</h1>
        <div className="chat-container">
          <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Dame una receta rápida con pollo y arroz"
          />
          <button onClick={generateRecipe} disabled={loading}>
            {loading ? 'Cocinando idea...' : 'Generar Receta'}
          </button>
        </div>
        {recipe && (
          <div className="recipe-display">
            <pre>{recipe}</pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;