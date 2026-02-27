/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChefHat, 
  Languages, 
  Camera, 
  Sparkles, 
  UtensilsCrossed, 
  Loader2,
  X,
  Plus,
  FlipHorizontal,
  Utensils,
  Flame,
  Carrot,
  Leaf,
  Wheat,
  Soup,
  Citrus,
  History,
  User,
  CreditCard,
  Crown,
  CheckCircle2,
  ArrowRight,
  Share2,
  Trash2,
  Download,
  QrCode,
  Zap
} from 'lucide-react';
import { generateRecipe, Recipe } from './services/gemini';
import RecipeCard from './components/RecipeCard';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Language = 'es' | 'en';
type Tab = 'home' | 'history' | 'pro' | 'profile';

interface UserProfile {
  name: string;
  email: string;
  region: string;
  language: Language;
  preferences: string[];
}

export default function App() {
  const [language, setLanguage] = useState<Language>('es');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  // MVP Monetization State
  const [credits, setCredits] = useState(() => {
    try {
      const saved = localStorage.getItem('chefia_credits');
      return saved ? parseInt(saved) : 3;
    } catch (e) {
      return 3;
    }
  });
  const [isPro, setIsPro] = useState(() => {
    try {
      return localStorage.getItem('chefia_is_pro') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [savedRecipes, setSavedRecipes] = useState<Array<{recipe: Recipe, imageUrl: string, date: string}>>(() => {
    try {
      const saved = localStorage.getItem('chefia_saved');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('chefia_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [showRegistration, setShowRegistration] = useState(!userProfile);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('chefia_credits', credits.toString());
      localStorage.setItem('chefia_is_pro', isPro.toString());
      localStorage.setItem('chefia_saved', JSON.stringify(savedRecipes));
      if (userProfile) {
        localStorage.setItem('chefia_profile', JSON.stringify(userProfile));
        setLanguage(userProfile.language);
      }
    } catch (e) {
      console.warn("LocalStorage access failed", e);
    }
  }, [credits, isPro, savedRecipes, userProfile]);

  const t = {
    es: {
      title: "ChefIA Pro",
      subtitle: "Inteligencia Culinaria MVP",
      placeholder: "Ej: Cena keto con salmón y espárragos...",
      generate: "Generar con 1 Crédito",
      upload: "Subir foto",
      camera: "Cámara",
      capture: "Capturar",
      close: "Cerrar",
      loading: "Cocinando tu receta...",
      restrictions: "Preferencias",
      newRecipe: "Nueva Receta",
      language: "Idioma",
      credits: "Créditos",
      history: "Mis Recetas",
      upgrade: "Hazte Pro",
      noCredits: "Sin créditos. ¡Pásate a Pro para ilimitados!",
      proFeature: "Función exclusiva de ChefIA Pro",
      save: "Guardar Receta",
      saved: "Guardada",
      profile: "Perfil",
      name: "Nombre",
      region: "Región",
      preferences: "Preferencias Dietéticas",
      saveProfile: "Guardar Perfil",
      welcome: "¡Bienvenido a ChefIA!",
      onboarding: "Configura tu perfil para una experiencia personalizada.",
      clearHistory: "Borrar todo el historial",
      confirmClear: "¿Estás seguro de borrar todas las recetas guardadas?",
      logout: "Cerrar Sesión",
      terms: "Términos y Privacidad",
      selectLanguage: "Seleccionar Idioma",
      privacyPolicy: "Política de Privacidad",
      termsOfService: "Términos de Servicio",
      mvpNotice: "Esta es una versión MVP. Los pagos son simulados para demostración."
    },
    en: {
      title: "ChefIA Pro",
      subtitle: "MVP Culinary Intelligence",
      placeholder: "E.g.: Keto dinner with salmon and asparagus...",
      generate: "Generate with 1 Credit",
      upload: "Upload photo",
      camera: "Camera",
      capture: "Capture",
      close: "Close",
      loading: "Cooking your recipe...",
      restrictions: "Preferences",
      newRecipe: "New Recipe",
      language: "Language",
      credits: "Credits",
      history: "My Recipes",
      upgrade: "Go Pro",
      noCredits: "Out of credits. Go Pro for unlimited!",
      proFeature: "Exclusive ChefIA Pro feature",
      save: "Save Recipe",
      saved: "Saved",
      profile: "Profile",
      name: "Name",
      region: "Region",
      preferences: "Dietary Preferences",
      saveProfile: "Save Profile",
      welcome: "Welcome to ChefIA!",
      onboarding: "Set up your profile for a personalized experience.",
      clearHistory: "Clear all history",
      confirmClear: "Are you sure you want to delete all saved recipes?",
      logout: "Logout",
      terms: "Terms & Privacy",
      selectLanguage: "Select Language",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      mvpNotice: "This is an MVP version. Payments are simulated for demonstration."
    }
  }[language];

  const handleRegistration = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const profile: UserProfile = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      region: formData.get('region') as string,
      language: formData.get('language') as Language,
      preferences: (formData.get('preferences') as string).split(',').map(s => s.trim()).filter(s => s)
    };
    setUserProfile(profile);
    setLanguage(profile.language);
    setShowRegistration(false);
  };

  const clearAllHistory = () => {
    if (window.confirm(t.confirmClear)) {
      setSavedRecipes([]);
    }
  };

  const handleGenerate = async () => {
    if (!isPro && credits <= 0) {
      setActiveTab('pro');
      return;
    }
    if (!input && !imagePreview) return;
    
    setLoading(true);
    setError(null);
    try {
      const { recipe: newRecipe, imageUrl: newImageUrl } = await generateRecipe(
        input || "Genera una receta creativa",
        language,
        imagePreview || undefined,
        userProfile ? { region: userProfile.region, preferences: userProfile.preferences } : undefined
      );
      setRecipe(newRecipe);
      setImageUrl(newImageUrl);
      
      if (!isPro) setCredits(prev => prev - 1);
    } catch (err: any) {
      console.error("Error generating recipe:", err);
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = () => {
    if (!recipe) return;
    const newItem = { recipe, imageUrl, date: new Date().toLocaleDateString() };
    setSavedRecipes(prev => [newItem, ...prev]);
  };

  const deleteRecipe = (idx: number) => {
    setSavedRecipes(prev => prev.filter((_, i) => i !== idx));
  };

  const shareRecipe = async () => {
    const element = document.getElementById('recipe-card-to-share');
    if (!element) return;
    
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(element, { quality: 0.95, backgroundColor: '#FDF8F1' });
      const link = document.createElement('a');
      link.download = `ChefIA-${recipe?.title || 'receta'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error sharing recipe:', err);
      setError("No se pudo generar la imagen para compartir.");
    }
  };

  const reset = () => {
    setRecipe(null);
    setImageUrl('');
    setInput('');
    setImagePreview(null);
    setActiveTab('home');
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);
      stopCamera();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-6 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-chef-primary rounded-2xl flex items-center justify-center text-white shadow-lg relative">
            <ChefHat size={28} />
            {isPro && (
              <div className="absolute -top-2 -right-2 bg-chef-accent text-white p-1 rounded-full shadow-sm">
                <Crown size={12} />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight">{t.title}</h1>
            <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isPro && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-chef-accent/10 rounded-full text-chef-accent text-xs font-bold">
              <Zap size={14} />
              {credits} {t.credits}
            </div>
          )}
          <button 
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-colors text-sm font-medium"
          >
            <Languages size={16} />
            {language.toUpperCase()}
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-300 transition-all"
          >
            <User size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mb-32">
        <AnimatePresence mode="wait">
          {showRegistration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[60] bg-white flex items-center justify-center p-6"
            >
              <div className="max-w-md w-full bg-white p-8 rounded-[40px] shadow-2xl border border-stone-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-chef-primary rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-4">
                    <ChefHat size={32} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold">{t.welcome}</h2>
                  <p className="text-stone-500 mt-2">{t.onboarding}</p>
                </div>
                
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-1 ml-2">{t.name}</label>
                    <input name="name" required className="w-full px-5 py-3 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-chef-primary/20" placeholder="Juan Pérez" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-1 ml-2">Email</label>
                    <input name="email" type="email" required className="w-full px-5 py-3 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-chef-primary/20" placeholder="juan@ejemplo.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-1 ml-2">{t.region}</label>
                    <select name="region" className="w-full px-5 py-3 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-chef-primary/20">
                      <option value="latam">Latinoamérica</option>
                      <option value="europe">Europa</option>
                      <option value="north_america">Norteamérica</option>
                      <option value="asia">Asia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-1 ml-2">{t.language}</label>
                    <select name="language" defaultValue={language} className="w-full px-5 py-3 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-chef-primary/20">
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-1 ml-2">{t.preferences}</label>
                    <input name="preferences" className="w-full px-5 py-3 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-chef-primary/20" placeholder="Vegano, Sin Gluten..." />
                  </div>
                  <button type="submit" className="w-full py-4 bg-chef-primary text-white rounded-full font-bold shadow-lg hover:bg-stone-700 transition-all mt-4">
                    {t.saveProfile}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'home' && (
            !recipe ? (
              <motion.div 
                key="input-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto mt-12"
              >
                <div className="text-center mb-12">
                  <h2 className="text-5xl md:text-6xl font-serif font-medium mb-4">
                    ¿Qué cocinamos hoy?
                  </h2>
                  {!isPro && credits <= 0 ? (
                    <p className="text-chef-accent font-bold text-lg animate-pulse">
                      {t.noCredits}
                    </p>
                  ) : (
                    <p className="text-stone-500 text-lg">
                      Describe tus antojos o usa la cámara.
                    </p>
                  )}
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-stone-100">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder}
                    className="w-full h-40 p-6 bg-stone-50 rounded-3xl border-none focus:ring-2 focus:ring-chef-primary/20 resize-none text-lg font-serif placeholder:text-stone-300 transition-all"
                  />

                  <div className="mt-6 flex flex-wrap gap-4 items-center">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all text-sm font-semibold"
                    >
                      <Plus size={18} />
                      {t.upload}
                    </button>
                    <button 
                      onClick={startCamera}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-chef-primary/10 text-chef-primary hover:bg-chef-primary/20 transition-all text-sm font-semibold"
                    >
                      <Camera size={18} />
                      {t.camera}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />

                    {imagePreview && (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-chef-primary shadow-md">
                        <img src={imagePreview} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setImagePreview(null)}
                          className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Camera Overlay */}
                  <AnimatePresence>
                    {isCameraOpen && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4"
                      >
                        <div className="relative w-full max-w-lg aspect-[3/4] bg-stone-900 rounded-3xl overflow-hidden shadow-2xl">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                          />
                          <button 
                            onClick={stopCamera}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
                          >
                            <X size={24} />
                          </button>
                        </div>
                        
                        <div className="mt-8 flex gap-6">
                          <button 
                            onClick={capturePhoto}
                            className="w-20 h-20 bg-white rounded-full border-4 border-stone-300 flex items-center justify-center shadow-xl active:scale-95 transition-all"
                          >
                            <div className="w-16 h-16 bg-white rounded-full border-2 border-stone-800" />
                          </button>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={loading || (!input && !imagePreview) || (!isPro && credits <= 0)}
                    className={cn(
                      "w-full mt-8 py-5 rounded-full bg-chef-primary text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-stone-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                      loading && "animate-pulse"
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        {t.loading}
                      </>
                    ) : (
                      <>
                        <Sparkles size={22} />
                        {t.generate}
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Vegano', 'Sin Gluten', 'Keto', 'Bajo en Calorías'].map((tag) => (
                    <button 
                      key={tag}
                      onClick={() => setInput(prev => prev + (prev ? ', ' : '') + tag)}
                      className="p-4 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md hover:border-chef-primary/20 transition-all text-center"
                    >
                      <span className="text-sm font-bold text-stone-600">{tag}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="recipe-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
              >
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <button 
                    onClick={reset}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-chef-primary text-white font-bold shadow-lg hover:bg-stone-700 transition-all text-sm"
                  >
                    <Plus size={18} />
                    {t.newRecipe}
                  </button>
                  <button 
                    onClick={saveToHistory}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-stone-200 text-stone-700 font-bold shadow-sm hover:bg-stone-50 transition-all text-sm"
                  >
                    <History size={18} />
                    {t.save}
                  </button>
                  <button 
                    onClick={shareRecipe}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-chef-accent text-white font-bold shadow-lg hover:opacity-90 transition-all text-sm"
                  >
                    <Share2 size={18} />
                    Compartir Tarjeta
                  </button>
                </div>
                <div id="recipe-card-to-share">
                  <RecipeCard recipe={recipe} imageUrl={imageUrl} isPro={isPro} language={language} />
                </div>
              </motion.div>
            )
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto mt-12"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-serif font-bold">{t.history}</h2>
                {savedRecipes.length > 0 && (
                  <button 
                    onClick={clearAllHistory}
                    className="text-red-500 text-sm font-bold flex items-center gap-2 hover:underline"
                  >
                    <Trash2 size={16} />
                    {t.clearHistory}
                  </button>
                )}
              </div>
              {savedRecipes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[40px] border border-stone-100">
                  <History size={64} className="mx-auto text-stone-200 mb-4" />
                  <p className="text-stone-400">Aún no has guardado ninguna receta.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedRecipes.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all group relative"
                    >
                      <div 
                        onClick={() => {
                          setRecipe(item.recipe);
                          setImageUrl(item.imageUrl);
                          setActiveTab('home');
                        }}
                        className="aspect-video relative overflow-hidden cursor-pointer"
                      >
                        <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full">
                          {item.date}
                        </div>
                      </div>
                      <div className="p-6 flex justify-between items-start">
                        <div 
                          className="cursor-pointer"
                          onClick={() => {
                            setRecipe(item.recipe);
                            setImageUrl(item.imageUrl);
                            setActiveTab('home');
                          }}
                        >
                          <h3 className="text-xl font-serif font-bold mb-2">{item.recipe.title}</h3>
                          <p className="text-stone-500 text-sm line-clamp-2">{item.recipe.description}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRecipe(idx);
                          }}
                          className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'pro' && (
            <motion.div 
              key="pro-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto mt-12"
            >
              <div className="bg-stone-900 text-white p-12 rounded-[50px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Crown size={200} />
                </div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-chef-accent rounded-full text-xs font-bold mb-6">
                    <Crown size={14} />
                    CHEFIA PREMIUM
                  </div>
                  
                  <h2 className="text-5xl font-serif font-bold mb-6">Desbloquea tu potencial culinario</h2>
                  
                  <div className="space-y-4 mb-10">
                    {[
                      'Generaciones ilimitadas',
                      'Acceso a modelos de IA avanzados',
                      'Guardado en la nube ilimitado',
                      'Sin anuncios (próximamente)',
                      'Soporte prioritario'
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-chef-accent" />
                        <span className="text-stone-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      setIsPro(true);
                      setActiveTab('home');
                    }}
                    className="w-full py-5 bg-white text-stone-900 rounded-full font-bold text-xl flex items-center justify-center gap-3 hover:bg-stone-100 transition-all"
                  >
                    {isPro ? 'Ya eres PRO' : 'Actualizar ahora - $4.99/mes'}
                    <ArrowRight size={22} />
                  </button>
                  
                  <p className="text-center mt-6 text-stone-500 text-xs">
                    {t.mvpNotice}
                  </p>
                  
                  <div className="mt-12 pt-8 border-t border-white/10 flex justify-center gap-6 text-[10px] text-stone-500 uppercase font-bold tracking-widest">
                    <button className="hover:text-white transition-colors">{t.privacyPolicy}</button>
                    <button className="hover:text-white transition-colors">{t.termsOfService}</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto mt-12"
            >
              <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-stone-100">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-20 h-20 bg-stone-100 rounded-3xl flex items-center justify-center text-stone-400">
                    <User size={40} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-bold">{userProfile?.name}</h2>
                    <p className="text-stone-500">{userProfile?.email}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-stone-50 rounded-3xl">
                      <p className="text-xs font-bold text-stone-400 uppercase mb-1">{t.region}</p>
                      <p className="font-bold text-stone-700 capitalize">{userProfile?.region.replace('_', ' ')}</p>
                    </div>
                    <button 
                      onClick={() => {
                        const newLang = language === 'es' ? 'en' : 'es';
                        setLanguage(newLang);
                        if (userProfile) setUserProfile({...userProfile, language: newLang});
                      }}
                      className="p-6 bg-stone-50 rounded-3xl text-left hover:bg-stone-100 transition-all"
                    >
                      <p className="text-xs font-bold text-stone-400 uppercase mb-1">{t.language}</p>
                      <p className="font-bold text-stone-700 uppercase flex items-center justify-between">
                        {userProfile?.language}
                        <Languages size={14} className="text-chef-primary" />
                      </p>
                    </button>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase mb-3 ml-2">{t.preferences}</p>
                    <div className="flex flex-wrap gap-2">
                      {userProfile?.preferences.map((p, i) => (
                        <span key={i} className="px-4 py-2 bg-chef-primary/10 text-chef-primary rounded-full text-sm font-bold">
                          {p}
                        </span>
                      ))}
                      <button onClick={() => setShowRegistration(true)} className="px-4 py-2 border border-dashed border-stone-300 text-stone-400 rounded-full text-sm font-bold hover:border-chef-primary hover:text-chef-primary transition-all">
                        + Editar
                      </button>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-stone-100 flex flex-col gap-4">
                    <button 
                      onClick={() => {
                        localStorage.removeItem('chefia_profile');
                        setUserProfile(null);
                        setShowRegistration(true);
                      }}
                      className="w-full py-4 bg-stone-100 text-stone-600 rounded-full font-bold hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                    >
                      {t.logout}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-xl border border-stone-200 rounded-full shadow-2xl p-2 flex items-center justify-between z-40">
        <button 
          onClick={() => setActiveTab('home')}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-all",
            activeTab === 'home' ? "bg-chef-primary text-white" : "text-stone-400 hover:text-stone-600"
          )}
        >
          <Utensils size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Inicio</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-all",
            activeTab === 'history' ? "bg-chef-primary text-white" : "text-stone-400 hover:text-stone-600"
          )}
        >
          <History size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Recetas</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-all",
            activeTab === 'profile' ? "bg-chef-primary text-white" : "text-stone-400 hover:text-stone-600"
          )}
        >
          <User size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Perfil</span>
        </button>

        <button 
          onClick={() => setActiveTab('pro')}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-all",
            activeTab === 'pro' ? "bg-chef-accent text-white" : "text-stone-400 hover:text-stone-600"
          )}
        >
          <Crown size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Premium</span>
        </button>
      </nav>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-[0.03] select-none">
        <div className="absolute top-[10%] left-[5%] rotate-12"><Utensils size={120} /></div>
        <div className="absolute top-[15%] right-[10%] -rotate-12"><ChefHat size={150} /></div>
        <div className="absolute top-[40%] left-[15%] rotate-45"><Flame size={80} /></div>
        <div className="absolute top-[35%] right-[20%] -rotate-45"><Leaf size={100} /></div>
        <div className="absolute bottom-[20%] left-[10%] -rotate-12"><Carrot size={110} /></div>
        <div className="absolute bottom-[15%] right-[5%] rotate-12"><Wheat size={130} /></div>
        <div className="absolute top-[60%] right-[15%] rotate-90"><Citrus size={90} /></div>
        <div className="absolute bottom-[40%] right-[30%] -rotate-12"><Soup size={100} /></div>
        <div className="absolute top-[70%] left-[25%] -rotate-45"><UtensilsCrossed size={140} /></div>
        
        {/* Subtle gradients for depth */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-chef-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-chef-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
