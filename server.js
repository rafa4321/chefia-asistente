import { useState } from 'react';
import './App.css';

function App() {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRecipe = async () => {
    if (!ingredients) return alert("Escribe algo primero");
    
    setLoading(true);
    try {
      // IMPORTANTE: Esta es la URL de tu servidor en Render
      const response = await fetch('https://chefia-asistente.onrender.com/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients })
      });

      const data = await response.json();
      if (data.recipe) {
        setRecipe(data.recipe);
      } else {
        setRecipe("Hubo un problema con la respuesta.");
      }
    } catch (error) {
      console.error(error);
      setRecipe("Error: No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>ChefIA Pro</h1>
      <textarea 
        value={ingredients} 
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Ej: Tomate, cebolla, pollo..."
      />
      <button onClick={generateRecipe} disabled={loading}>
        {loading ? "Cocinando..." : "Generar Receta"}
      </button>
      <div className="result">
        {recipe}
      </div>
    </div>
  );
}

export default App;