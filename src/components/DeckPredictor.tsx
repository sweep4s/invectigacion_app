import React, { useState } from "react";
import { Card, PredictDeckResponse } from "../types";
import { Sparkles, Trophy, Shuffle, RotateCcw, Swords, Plus, X, ListCollapse, BookOpen } from "lucide-react";

interface Props {
  cards: Card[];
}

export default function DeckPredictor({ cards }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>(["mortar", "knight", "skeletons", "poison", "the_log", "miner", "ice_golem", "goblin_gang"]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterEvolution, setFilterEvolution] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictDeckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSelectCard = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
      setResult(null);
    } else {
      if (selectedIds.length >= 8) return;
      setSelectedIds([...selectedIds, id]);
      setResult(null);
    }
  };

  const handleClearDeck = () => {
    setSelectedIds([]);
    setResult(null);
    setError(null);
  };

  const handleRandomDeck = () => {
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    setSelectedIds(shuffled.slice(0, 8).map(c => c.id));
    setResult(null);
    setError(null);
  };

  const handlePredictDeck = async () => {
    if (selectedIds.length !== 8) {
      setError("Debes seleccionar exactamente 8 cartas para formar un mazo válido.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/clash/predict-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardIds: selectedIds }),
      });
      const data = await response.json();
      if (response.ok && data.status === "success") {
        setResult(data);
      } else {
        setError(data.message || "Error al realizar la predicción de IA.");
      }
    } catch (err: any) {
      setError("No se pudo conectar con el servidor de predicción.");
    } finally {
      setLoading(false);
    }
  };

  // Safe and clean localized markdown formatting
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.trim().startsWith("###")) {
        return <h3 key={idx} className="text-base font-semibold text-amber-400 mt-4 mb-2 font-display">{line.replace("###", "").trim()}</h3>;
      }
      if (line.trim().startsWith("##")) {
        return <h2 key={idx} className="text-lg font-bold text-amber-500 mt-5 mb-2 font-display">{line.replace("##", "").trim()}</h2>;
      }
      if (line.trim().startsWith("#")) {
        return <h1 key={idx} className="text-xl font-extrabold text-amber-500 mt-6 mb-3 font-display">{line.replace("#", "").trim()}</h1>;
      }
      if (line.trim().startsWith("*") || line.trim().startsWith("-")) {
        return (
          <li key={idx} className="text-xs text-gray-300 ml-4 list-disc mb-1">
            {line.replace(/^[\s*-]+/, "").trim()}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs text-gray-300 leading-relaxed mb-1">{line}</p>;
    });
  };

  const filteredCards = cards.filter(c => {
    if (filterType !== "all" && c.type !== filterType) return false;
    if (filterEvolution !== null && c.hasEvolution !== filterEvolution) return false;
    return true;
  });

  return (
    <div className="space-y-8" id="container-deck-predictor">
      {/* Selector Grid and Selected Deck area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Selector Panel */}
        <div className="lg:col-span-7 bg-[#1E293B] border-2 border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h2 className="text-xl font-display font-black text-[#FBBF24] uppercase italic flex items-center gap-2">
                  <Swords className="w-5 h-5 text-[#FBBF24]" />
                  Creador y Analizador de Sinergias
                </h2>
                <p className="text-xs text-blue-200 font-sans mt-0.5">
                  Elige 8 cartas para evaluar su viabilidad contra el meta actual mediante el modelo predictivo de IA.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  id="btn-random-deck"
                  onClick={handleRandomDeck}
                  className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#3B82F6] border-b-2 border-[#1D4ED8] text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-all active:translate-y-[1px] active:border-b-0 cursor-pointer"
                  title="Mazo aleatorio"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Aleatorio</span>
                </button>
                <button
                  id="btn-clear-deck"
                  onClick={handleClearDeck}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 border-b-2 border-red-800 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-all active:translate-y-[1px] active:border-b-0 cursor-pointer"
                  title="Reiniciar selección"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Limpiar</span>
                </button>
              </div>
            </div>

            {/* Selector Filters */}
            <div className="flex flex-wrap gap-2 mb-4 bg-black/20 p-2 rounded-lg border border-white/10">
              <button
                id="btn-filter-all"
                onClick={() => setFilterType("all")}
                className={`px-3 py-1 text-xs rounded font-bold uppercase transition-all ${
                  filterType === "all" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-inner" : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                Todos
              </button>
              <button
                id="btn-filter-tropa"
                onClick={() => setFilterType("tropa")}
                className={`px-3 py-1 text-xs rounded font-bold uppercase transition-all ${
                  filterType === "tropa" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-inner" : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                Tropas
              </button>
              <button
                id="btn-filter-hechizo"
                onClick={() => setFilterType("hechizo")}
                className={`px-3 py-1 text-xs rounded font-bold uppercase transition-all ${
                  filterType === "hechizo" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-inner" : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                Hechizos
              </button>
              <button
                id="btn-filter-estructura"
                onClick={() => setFilterType("estructura")}
                className={`px-3 py-1 text-xs rounded font-bold uppercase transition-all ${
                  filterType === "estructura" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-inner" : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                Estructuras
              </button>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <button
                id="btn-filter-evo-all"
                onClick={() => setFilterEvolution(filterEvolution === null ? true : filterEvolution === true ? false : null)}
                className={`px-3 py-1 text-xs rounded border font-bold uppercase transition-all ${
                  filterEvolution === true
                    ? "bg-purple-600 border-purple-400 text-white"
                    : filterEvolution === false
                    ? "bg-slate-800 border-slate-600 text-slate-300"
                    : "border-transparent text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {filterEvolution === true ? "Evoluciones" : filterEvolution === false ? "Básicas" : "Filtrar Evo"}
              </button>
            </div>

            {/* Cards selection grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {filteredCards.map(c => {
                const isSelected = selectedIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    id={`btn-toggle-card-${c.id}`}
                    onClick={() => toggleSelectCard(c.id)}
                    className={`relative p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-[105px] overflow-hidden group ${
                      isSelected
                        ? "bg-amber-400/10 border-[#FBBF24] ring-2 ring-[#FBBF24]/30 shadow-md scale-[0.98]"
                        : "bg-[#0F172A] border-white/5 hover:border-white/20 hover:scale-[1.01]"
                    }`}
                  >
                    {/* Card background/side illustration */}
                    {c.imgUrl && (
                      <img
                        src={c.imgUrl}
                        alt={c.name}
                        className="absolute -right-1 -bottom-2 w-[55px] h-[65px] object-contain pointer-events-none opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all z-0"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Evo Badge */}
                    {c.hasEvolution && (
                      <span className="absolute top-1.5 right-1.5 bg-[#9333EA] text-white text-[8px] font-mono font-black px-1 rounded border border-white z-10">
                        EVO
                      </span>
                    )}

                    <div className="relative z-10">
                      <span className="text-gray-400 text-[9px] font-mono leading-none block uppercase font-bold">
                        {c.rarity}
                      </span>
                      <h4 className="text-white font-display text-xs font-black leading-tight pr-5 mt-1 truncate uppercase">
                        {c.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between w-full mt-2 relative z-10">
                      <span className="text-[10px] font-black text-white bg-purple-600 border border-purple-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                        {c.elixir}🧪
                      </span>

                      {isSelected ? (
                        <span className="text-[10px] bg-[#FBBF24] text-[#1E3A8A] font-black px-1.5 py-0.5 rounded-md border border-white shadow">
                          ✓
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded border border-white/5">
                          +
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt/Predict button at bottom */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-blue-200">
                Seleccionadas: <strong className="text-[#FBBF24] font-black">{selectedIds.length}</strong> de <strong>8</strong> cartas
              </div>

              <button
                id="btn-evaluate-meta"
                onClick={handlePredictDeck}
                disabled={selectedIds.length !== 8 || loading}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-display font-black uppercase tracking-tight text-xs flex items-center justify-center gap-2 transition-all active:translate-y-[2px] ${
                  selectedIds.length === 8 && !loading
                    ? "bg-[#FBBF24] text-[#1E3A8A] border-b-4 border-amber-600 hover:bg-yellow-400 cursor-pointer shadow-lg shadow-[#FBBF24]/10"
                    : "bg-[#0F172A] text-gray-500 border border-white/5 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#1E3A8A] border-t-[#FBBF24] mr-1" />
                    Neural Engine Inicializando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                    Predecir Rendimiento del Mazo
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-950/20 border border-red-500/30 text-red-300 text-xs rounded-lg text-center font-mono">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Selected Deck Panel */}
        <div className="lg:col-span-5 bg-[#1E293B] border-2 border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-display font-black text-white uppercase tracking-wider mb-4 pb-2 border-b border-white/10">
              Tu Mazo Seleccionado
            </h3>

            {selectedIds.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center bg-black/20 rounded-xl border border-dashed border-white/15">
                <span className="text-3xl">📦</span>
                <p className="text-blue-200 text-xs mt-3 leading-relaxed max-w-[200px]">
                  Selecciona cartas de la izquierda para llenar tu mazo de 8 cartas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 mb-6">
                {selectedIds.map(id => {
                  const card = cards.find(c => c.id === id);
                  if (!card) return null;

                  // Map rarity to energetic card gradients
                  let cardGrad = "from-blue-300 to-blue-500";
                  if (card.rarity.toLowerCase() === "legendary") cardGrad = "from-yellow-300 via-purple-400 to-blue-400";
                  else if (card.rarity.toLowerCase() === "epic") cardGrad = "from-purple-400 to-purple-600";
                  else if (card.rarity.toLowerCase() === "rare") cardGrad = "from-orange-300 to-orange-500";

                  return (
                    <div
                      key={id}
                      className={`relative bg-gradient-to-b ${cardGrad} p-0.5 rounded-xl flex flex-col justify-between aspect-[3/4] text-center group overflow-hidden border border-white/60 shadow-md`}
                    >
                      <div className="bg-black/85 h-full rounded-lg flex flex-col items-center justify-between p-1.5 relative">
                        {/* Remove button overlay */}
                        <button
                          id={`btn-remove-selected-${id}`}
                          onClick={() => toggleSelectCard(id)}
                          className="absolute -top-1 -right-1 p-1 bg-red-600 text-white rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all z-20 hover:bg-red-700"
                          title="Remover"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>

                        {/* Float elixir bubble */}
                        <div className="absolute top-1 left-1 bg-purple-600 text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border border-white">
                          {card.elixir}
                        </div>

                        <div className="flex-1 flex items-center justify-center w-full min-h-0 pt-4 pb-1 relative z-10">
                          {card.imgUrl ? (
                            <img
                              src={card.imgUrl}
                              alt={card.name}
                              className="h-full max-h-[50px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-all"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-2xl select-none">
                              {card.type === "hechizo" ? "🔮" : card.type === "estructura" ? "🏗️" : "⚔️"}
                            </div>
                          )}
                        </div>

                        <div className="w-full">
                          <p className="text-[9px] font-black uppercase text-white truncate px-1 mt-0.5">{card.name}</p>
                          <p className="text-amber-400 text-[7px] font-bold uppercase">{card.rarity}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty placeholders to reach 8 */}
                {Array.from({ length: 8 - selectedIds.length }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-black/10 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center aspect-[3/4] text-gray-500 text-lg select-none"
                  >
                    +
                  </div>
                ))}
              </div>
            )}

            {/* General metrics calculated if deck assembled but server not called yet */}
            {selectedIds.length === 8 && (
              <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/10">
                <h4 className="text-xs font-black text-white font-mono uppercase tracking-widest">Métricas Estáticas Rápidas</h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Costo Medio:</span>
                    <strong className="text-white block mt-0.5">
                      {Number((selectedIds.reduce((sum, id) => sum + (cards.find(c => c.id === id)?.elixir || 0), 0) / 8).toFixed(1))}🧪 Elíxir
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Evoluciones:</span>
                    <strong className="text-purple-400 block mt-0.5">
                      {selectedIds.filter(id => cards.find(c => c.id === id)?.hasEvolution).length} activas
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#374151] flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Distribución de Tipos:</span>
                  <span className="text-gray-300 font-mono">
                    {selectedIds.filter(id => cards.find(c => c.id === id)?.type === "tropa").length}T /{" "}
                    {selectedIds.filter(id => cards.find(c => c.id === id)?.type === "hechizo").length}S /{" "}
                    {selectedIds.filter(id => cards.find(c => c.id === id)?.type === "estructura").length}E
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="bg-[#FBBF24]/5 border-2 border-[#FBBF24]/30 p-4 rounded-xl flex items-start gap-3">
              <span className="text-xl">🏆</span>
              <p className="text-[11px] text-[#FBBF24] leading-relaxed font-sans">
                <strong>Análisis No Lineal:</strong> Un índice de sinergia superior a 75 indica que el mazo calza con arquetipos del meta profesional, minimizando la vulnerabilidad frente a parches de balance.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Prediction Results Block */}
      {result && (
        <div className="bg-[#1E293B] border-2 border-[#FBBF24] rounded-2xl p-6 shadow-2xl space-y-6" id="block-predictions-result">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-4">
            <div>
              <span className="bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Análisis Neural Predictivo
              </span>
              <h3 className="text-xl font-display font-black text-white mt-1.5 flex items-center gap-2 uppercase tracking-tight italic">
                Resultados del Procesador de Datos
              </h3>
            </div>

            <div className="flex items-center gap-4 bg-black/30 px-4 py-2.5 rounded-xl border border-white/10">
              <div>
                <span className="text-[8px] font-mono text-blue-200 block uppercase font-black">Calificación Meta</span>
                <span className="text-2xl font-black text-[#FBBF24] font-display italic tracking-tight">
                  {result.metrics.metaRating} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="text-[8px] font-mono text-blue-200 block uppercase font-black">Win Rate Previsto</span>
                <span className="text-2xl font-black text-green-400 font-display italic tracking-tight">{result.metrics.predictedWinRate}%</span>
              </div>
            </div>
          </div>

          {/* Graphical dials and scores */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-black/20 p-4 border border-white/5 rounded-xl text-center">
              <span className="text-[10px] text-[#FBBF24] font-mono block uppercase font-black">Arquetipo Identificado</span>
              <span className="text-sm font-black text-white mt-1.5 block uppercase tracking-tight">
                {result.metrics.primaryArchetype}
              </span>
              <span className="text-[9px] text-gray-400 block mt-1">Estimado inductivamente</span>
            </div>

            <div className="bg-black/20 p-4 border border-white/5 rounded-xl text-center">
              <span className="text-[10px] text-[#FBBF24] font-mono block uppercase font-black">Índice de Sinergias</span>
              <span className="text-sm font-black text-amber-400 mt-1.5 block">
                {result.metrics.synergyScore} %
              </span>
              <div className="w-full bg-[#0F172A] h-2 rounded-full mt-2.5 relative overflow-hidden border border-white/5">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${result.metrics.synergyScore}%` }} />
              </div>
            </div>

            <div className="bg-black/20 p-4 border border-white/5 rounded-xl text-center">
              <span className="text-[10px] text-[#FBBF24] font-mono block uppercase font-black">Costo Promedio Elíxir</span>
              <span className="text-sm font-black text-purple-400 mt-1.5 block">
                {result.metrics.avgElixir} 🧪
              </span>
              <span className="text-[9px] text-gray-400 block mt-1">Óptimo para ciclos de {result.metrics.cycleCount}s</span>
            </div>

            <div className="bg-black/20 p-4 border border-white/5 rounded-xl text-center">
              <span className="text-[10px] text-[#FBBF24] font-mono block uppercase font-black">Uso de Meta Estimado</span>
              <span className="text-sm font-black text-blue-400 mt-1.5 block">
                {result.metrics.predictedUseRate} %
              </span>
              <span className="text-[9px] text-gray-400 block mt-1">Popularidad del ecosistema 2026</span>
            </div>
          </div>

          {/* AI Markdown Evaluation Block */}
          <div className="bg-[#1E40AF]/10 border-2 border-[#1E40AF]/40 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-purple-600/20 text-purple-200 rounded-bl-xl border-l border-b border-purple-500/30 flex items-center gap-1.5 text-xs font-mono font-black uppercase">
              <BookOpen className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>Reporte de Estrategia AI</span>
            </div>

            <div className="prose prose-invert max-w-none text-xs space-y-4 pt-4 leading-relaxed text-gray-100">
              {renderMarkdown(result.aiEvaluation)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
