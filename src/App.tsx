import React, { useEffect, useState } from "react";
import { Card } from "./types";
import DeckPredictor from "./components/DeckPredictor";
import PatchSimulator from "./components/PatchSimulator";
import HistoryTrends from "./components/HistoryTrends";
import ModelWorkbench from "./components/ModelWorkbench";
import {
  Trophy,
  Swords,
  Beaker,
  Clock,
  Cpu,
  Calendar,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  Info,
  ChevronRight,
  ShieldCheck,
  Star
} from "lucide-react";

export default function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "predictor" | "simulator" | "history" | "workbench">("dashboard");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch("/api/clash/cards");
        const data = await response.json();
        if (response.ok && data.status === "success") {
          setCards(data.data);
        } else {
          setError("No se pudo cargar la base de datos de cartas del servidor.");
        }
      } catch (err) {
        setError("Error de conexión al cargar las cartas.");
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#f8fafc] flex flex-col font-sans relative" id="app-root">
      
      {/* Dynamic Background subtle graphic decor lines */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#1E40AF]/10 to-transparent pointer-events-none" />

      {/* Top Banner / Navigation Header */}
      <header className="bg-gradient-to-b from-[#1E40AF] to-[#1E3A8A] border-b-4 border-[#FBBF24] sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Branded Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FBBF24] rounded-xl text-[#1E3A8A] font-black shadow-inner border border-white">
              <Trophy className="w-6 h-6 text-[#1E3A8A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-black tracking-tight text-white uppercase italic">
                  MetaPredict CR
                </h1>
                <span className="bg-[#1E40AF] text-[#FBBF24] text-[10px] font-mono px-2 py-0.5 rounded border border-[#FBBF24] font-bold">
                  v2026.AI
                </span>
              </div>
              <span className="text-[11px] text-blue-200 block font-light leading-none mt-1">
                Análisis y Predicción de Datos de Competición (2023 - 2026)
              </span>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex flex-wrap gap-1 bg-black/30 p-1.5 rounded-xl border border-white/10">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                activeTab === "dashboard" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-md border-b-2 border-amber-600" : "text-blue-100 hover:text-white hover:bg-white/5"
              }`}
            >
              Inicio
            </button>
            <button
              id="nav-tab-predictor"
              onClick={() => setActiveTab("predictor")}
              className={`px-4 py-2 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                activeTab === "predictor" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-md border-b-2 border-amber-600" : "text-blue-100 hover:text-white hover:bg-white/5"
              }`}
            >
              Evaluador de Mazos
            </button>
            <button
              id="nav-tab-simulator"
              onClick={() => setActiveTab("simulator")}
              className={`px-4 py-2 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                activeTab === "simulator" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-md border-b-2 border-amber-600" : "text-blue-100 hover:text-white hover:bg-white/5"
              }`}
            >
              Simulador de Parches
            </button>
            <button
              id="nav-tab-history"
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                activeTab === "history" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-md border-b-2 border-amber-600" : "text-blue-100 hover:text-white hover:bg-white/5"
              }`}
            >
              Línea Temporal
            </button>
            <button
              id="nav-tab-workbench"
              onClick={() => setActiveTab("workbench")}
              className={`px-4 py-2 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                activeTab === "workbench" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-md border-b-2 border-amber-600" : "text-blue-100 hover:text-white hover:bg-white/5"
              }`}
            >
              Métricas IA
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <span className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent mb-4" />
            <p className="text-gray-400 text-sm">Inicializando base de datos predictiva de Clash Royale...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-2xl max-w-lg mx-auto text-center space-y-4">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-300">Hubo un problema al inicializar</h3>
            <p className="text-xs text-gray-400">{error}</p>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <div className="space-y-8 animate-fadeIn" id="tab-dashboard">
                
                {/* Hero Panel slide content style - styled with Vibrant Blue & Gold borders */}
                <div className="bg-gradient-to-r from-[#1E40AF]/30 via-[#1E293B] to-[#1E40AF]/30 border-2 border-[#FBBF24] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Trophy className="w-64 h-64 text-[#FBBF24]" />
                  </div>

                  <div className="max-w-2xl relative z-10 space-y-4">
                    <span className="bg-[#FBBF24]/10 text-[#F59E0B] border border-[#FBBF24]/30 text-[10px] uppercase tracking-wider font-mono px-3 py-1 rounded-full font-bold inline-block">
                      Modelamiento de Inteligencia Artificial Avanzado
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight italic tracking-tight">
                      PREDICCIÓN DEL METAJUEGO EN CLASH ROYALE
                    </h2>
                    <p className="text-sm text-gray-200 leading-relaxed font-sans">
                      Analiza y predice la evolución competitiva del ecosistema Clash Royale (años 2023 - 2026). 
                      Nuestra plataforma integra un análisis predictivo impulsado por redes LSTM y 
                      asistentes predictivos basados en Gemini AI para desglosar sinergias de cartas y tendencias del meta competitivo.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        id="hero-go-predictor"
                        onClick={() => setActiveTab("predictor")}
                        className="px-6 py-3 bg-[#FBBF24] hover:bg-amber-400 text-[#1E3A8A] font-display font-black rounded-xl text-xs uppercase tracking-tight flex items-center gap-1.5 transition-all shadow-lg active:translate-y-[2px] border-b-4 border-amber-600 cursor-pointer"
                      >
                        Crear y Predecir Mazo
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </button>
                      <button
                        id="hero-go-simulator"
                        onClick={() => setActiveTab("simulator")}
                        className="px-6 py-3 bg-[#2563EB] hover:bg-[#3B82F6] text-white font-display font-black rounded-xl text-xs uppercase tracking-tight flex items-center gap-1.5 transition-all shadow-lg active:translate-y-[2px] border-b-4 border-[#1D4ED8] cursor-pointer"
                      >
                        Simulador de Balances
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Specific Objectives / Grid Block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Objective 1 */}
                  <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-display font-black uppercase text-white tracking-tight">Consolidado 2023-2026</h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        Historial masivo de estadísticas de partidas competitivas que capturan la introducción de mecánicas disruptivas de Evolución de Cartas en la CRL.
                      </p>
                    </div>
                    <button
                      id="obj-link-history"
                      onClick={() => setActiveTab("history")}
                      className="text-[#FBBF24] text-xs font-mono font-black uppercase tracking-wider hover:underline flex items-center gap-1 mt-4"
                    >
                      Ver línea de tiempo
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Objective 2 */}
                  <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                        <Beaker className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-display font-black uppercase text-white tracking-tight">Simulador de Balances</h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        Aplica balances hipotéticos y predice cómo afectaría a las tasas de uso o efectividad de las cartas dentro del metajuego.
                      </p>
                    </div>
                    <button
                      id="obj-link-simulator"
                      onClick={() => setActiveTab("simulator")}
                      className="text-[#FBBF24] text-xs font-mono font-black uppercase tracking-wider hover:underline flex items-center gap-1 mt-4"
                    >
                      Modelar parche nuevo
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Objective 3 */}
                  <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 text-blue-400 flex items-center justify-center">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-display font-black uppercase text-white tracking-tight">Compensación LSTM / RF</h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        Compara el rendimiento predictivo de nuestra red neuronal recurrente y estimadores estáticos mediante métricas de error y Gini Importance.
                      </p>
                    </div>
                    <button
                      id="obj-link-workbench"
                      onClick={() => setActiveTab("workbench")}
                      className="text-[#FBBF24] text-xs font-mono font-black uppercase tracking-wider hover:underline flex items-center gap-1 mt-4"
                    >
                      Analizar curvas de pérdida
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* Showcase stats overview & cards slideshow */}
                <div className="bg-[#1E293B] border-2 border-white/10 rounded-2xl p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-display font-bold text-[#FBBF24] flex items-center gap-2 uppercase tracking-tight">
                        <Star className="w-5 h-5 text-[#FBBF24] fill-[#FBBF24]" />
                        Cartas Meta Destacadas en 2026
                      </h3>
                      <p className="text-xs text-blue-200">Picos de uso promedio registrados en torneos oficiales actuales.</p>
                    </div>

                    <button
                      id="btn-cards-more"
                      onClick={() => setActiveTab("history")}
                      className="text-xs text-[#FBBF24] hover:underline font-mono uppercase font-black"
                    >
                      Ver todos los datos
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {cards.slice(0, 5).map(c => {
                      // Map rarity to vibrant card gradients
                      let cardGrad = "from-blue-300 to-blue-500";
                      if (c.rarity.toLowerCase() === "legendary") cardGrad = "from-yellow-300 via-purple-400 to-blue-400";
                      else if (c.rarity.toLowerCase() === "epic") cardGrad = "from-purple-400 to-purple-600";
                      else if (c.rarity.toLowerCase() === "rare") cardGrad = "from-orange-300 to-orange-500";

                      return (
                        <div
                          key={c.id}
                          className={`aspect-[3/4] bg-gradient-to-b ${cardGrad} rounded-xl p-1 shadow-lg border-2 border-white relative overflow-hidden`}
                        >
                          <div className="bg-black/85 h-full rounded-lg flex flex-col items-center justify-between p-2">
                            {c.hasEvolution && (
                              <span className="absolute top-1.5 right-1.5 bg-[#9333EA] text-white text-[8px] font-black tracking-tight px-1 rounded border border-white font-mono">
                                EVO
                              </span>
                            )}
                            
                            <div className="absolute top-1 left-1 bg-purple-600 w-6 h-6 rounded-full border border-white flex items-center justify-center font-black text-[10px] text-white shadow">
                              {c.elixirCost}
                            </div>

                            <div className="flex-1 flex items-center justify-center text-4xl select-none pt-4">
                              {c.type === "spell" ? "🔮" : c.type === "building" ? "🏗️" : "⚔️"}
                            </div>
                            
                            <div className="w-full text-center">
                              <p className="text-[10px] font-black uppercase text-white truncate px-1 mt-1">{c.name}</p>
                              <p className="text-amber-400 text-[8px] font-bold uppercase">{c.rarity}</p>
                            </div>

                            <div className="w-full flex justify-between items-center mt-2 border-t border-white/10 pt-1.5 text-[9px] font-mono text-gray-300">
                              <span>Uso {c.stats2026.useRate}%</span>
                              <span className="text-green-400 font-bold">{c.stats2026.winRate}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Authors footer and PDF references block */}
                <div className="bg-[#1E40AF]/15 border-2 border-[#1E40AF]/30 p-6 rounded-2xl flex items-start gap-4">
                  <div className="p-3 bg-[#1E3A8A] text-[#FBBF24] rounded-lg flex-shrink-0 shadow border border-white/15">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                      Análisis de Datos del Metajuego
                    </h4>
                    <p className="text-xs text-blue-100 leading-relaxed font-sans">
                      La integración de datos de balance y entrenamiento tiene como objetivo analizar las tendencias de uso en el juego competitivo profesional. 
                      Todos los datos están alineados con el metajuego competitivo y la Clash Royale League (CRL).
                    </p>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "predictor" && <DeckPredictor cards={cards} />}

            {activeTab === "simulator" && <PatchSimulator cards={cards} />}

            {activeTab === "history" && <HistoryTrends cards={cards} />}

            {activeTab === "workbench" && <ModelWorkbench />}
          </>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-[#2d3748] bg-[#0d0f14] py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 Clash Royale MetaPredict AI. Desarrollado con ❤️ para entrenadores de eSports y Científicos de Datos.</p>
          <p className="text-[10px] font-mono font-light text-gray-600">
            La información y predicciones presentadas son de carácter teórico. Clash Royale es una marca registrada de Supercell Oy.
          </p>
        </div>
      </footer>
    </div>
  );
}
