import { Recipe } from "../services/gemini";
import { Clock, ChefHat, Flame, Crown, QrCode, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface RecipeCardProps {
  recipe: Recipe;
  imageUrl: string;
  isPro?: boolean;
  language?: 'es' | 'en';
}

export default function RecipeCard({ recipe, imageUrl, isPro, language = 'es' }: RecipeCardProps) {
  const t = {
    es: { ingredients: "Ingredientes", instructions: "Instrucciones" },
    en: { ingredients: "Ingredients", instructions: "Instructions" }
  }[language];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-stone-200 max-w-4xl mx-auto"
    >
      <div className="relative h-80 w-full">
        <img 
          src={imageUrl || "https://picsum.photos/seed/food/1200/800"} 
          alt={recipe.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-6 left-6 flex gap-2">
          {recipe.dietaryTags?.map((tag) => (
            <span key={tag} className="bg-chef-accent text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-8 md:p-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-4xl md:text-5xl font-serif font-medium leading-tight text-stone-900">
            {recipe.title}
          </h2>
          <div className="flex gap-6 text-stone-500">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-chef-primary" />
              <span className="text-sm font-medium">{recipe.prepTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat size={20} className="text-chef-primary" />
              <span className="text-sm font-medium">{recipe.difficulty}</span>
            </div>
            {recipe.calories && (
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-chef-primary" />
                <span className="text-sm font-medium">{recipe.calories}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-xl text-stone-600 italic font-serif mb-10 leading-relaxed border-l-4 border-chef-primary pl-6">
          "{recipe.description}"
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-3">
              <div className="w-8 h-px bg-chef-primary"></div>
              {t.ingredients}
            </h3>
            <ul className="space-y-4">
              {recipe.ingredients?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-stone-700">
                  <span className="text-chef-accent font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-3">
              <div className="w-8 h-px bg-chef-primary"></div>
              {t.instructions}
            </h3>
            <ol className="space-y-6">
              {recipe.instructions?.map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-chef-primary/10 text-chef-primary flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <p className="text-stone-700 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Commercial Offer Footer (Watermark) */}
      <div className="bg-stone-900 text-white p-6 flex items-center justify-between border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-chef-accent rounded-xl flex items-center justify-center">
            <ChefHat size={24} />
          </div>
          <div>
            <div className="font-serif font-bold text-lg leading-none flex items-center gap-2">
              ChefIA Pro
              {isPro && <Crown size={14} className="text-chef-accent" />}
            </div>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Inteligencia Culinaria MVP</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-chef-accent uppercase tracking-tighter">Disponible en</p>
            <p className="text-xs font-bold">Google Play Store</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-stone-900">
            <QrCode size={32} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
