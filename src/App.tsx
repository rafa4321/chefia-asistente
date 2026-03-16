import React, { useState } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const consultarChef = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setRecipe('');

    try {
      const response = await fetch('https://chefia-asistente.onrender.com/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setRecipe(data.recipe);
      } else {
        setRecipe(`Aviso: ${data.error || 'No se pudo obtener la receta'}`);
      }
    } catch (error) {
      setRecipe("Error de conexión con el servidor. Verifica tu internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F2] text-[#1A2E35] p-6 font-sans">
      <div className="max-w-2xl mx-auto pt-10">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-serif italic font-bold text-[#1A2E35]">ChefIA Pro</h1>
          <p className="mt-2 text-gray-600">Tu asistente culinario inteligente</p>
        </header>

        <div className="bg-white rounded-[2rem] shadow-2xl p-8 mb-6 border border-orange-50">
          <textarea 
            className="w-full border-none focus:ring-0 text-xl bg-transparent min-h-[150px] resize-none outline-none"
            placeholder="¿Qué ingredientes tienes o qué deseas cocinar?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <button 
          onClick={consultarChef}
          disabled={loading}
          className={`w-full py-5 rounded-full font-bold text-xl transition-all shadow-lg ${
            loading ? 'bg-gray-400' : 'bg-[#1A2E35] hover:bg-[#2c4a55] text-white active:scale-95'
          }`}
        >
          {loading ? 'Cocinando tu receta...' : 'CREAR RECETA'}
        </button>

        {recipe && (
          <div className="mt-10 p-8 bg-white rounded-3xl shadow-xl border border-orange-100 animate-fade-in">
            <div className="prose prose-slate max-w-none whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">
              {recipe}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;