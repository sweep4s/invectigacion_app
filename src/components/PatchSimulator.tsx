import React, { useState } from "react";
import { Card, CardAdjustment, SimulatePatchResponse } from "../types";
import { Beaker, Settings, RotateCcw, Play, CheckCircle, HelpCircle, FileDiff } from "lucide-react";

interface Props {
  cards: Card[];
}

export default function PatchSimulator({ cards }: Props) {
  const [adjustments, setAdjustments] = useState<CardAdjustment[]>([
    { cardId: "knight", type: "nerf", percentage: 15 },
    { cardId: "hog_rider", type: "buff", percentage: 10 }
  ]);
  const [selectedCardId, setSelectedCardId] = useState<string>("knight");
  const [selectedAdjType, setSelectedAdjType] = useState<"buff" | "nerf">("buff");
  const [selectedPercentage, setSelectedPercentage] = useState<number>(10);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SimulatePatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddAdjustment = () => {
    // Check if card is already adjusted
    const exists = adjustments.some(a => a.cardId === selectedCardId);
    if (exists) {
      setError("Esta carta ya cuenta con un ajuste de balance en la lista.");
      return;
    }
    setError(null);
    setAdjustments([...adjustments, { cardId: selectedCardId, type: selectedAdjType, percentage: selectedPercentage }]);
    setResult(null);
  };

  const handleRemoveAdjustment = (cardId: string) => {
    setAdjustments(adjustments.filter(a => a.cardId !== cardId));
    setResult(null);
  };

  const handleClearAdjustments = () => {
    setAdjustments([]);
    setResult(null);
    setError(null);
  };

  const handleSimulate = async () => {
    if (adjustments.length === 0) {
      setError("Por favor, agregue al menos un ajuste de balance a la simulación.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/clash/simulate-patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardAdjustments: adjustments }),
      });
      const data = await response.json();
      if (response.ok && data.status === "success") {
        setResult(data);
      } else {
        setError(data.message || "Error al calcular el impacto del parche.");
      }
    } catch (err) {
      setError("Fallo de conexión al simular el parche.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-8" id="container-patch-simulator">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column - Balance configuration inputs */}
        <div className="lg:col-span-5 bg-[#1E293B] border-2 border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-[#FBBF24] flex items-center gap-2 uppercase tracking-tight italic">
              <Beaker className="w-5 h-5 text-[#FBBF24] animate-pulse" />
              Laboratorio de Simulación
            </h2>
            <p className="text-[11px] text-blue-100 font-sans mt-1 mb-6 leading-relaxed">
              Formula hipótesis de causa-efecto ajustando atributos de juego y examina cómo reacciona el ecosistema global.
            </p>

            {/* Config Area */}
            <div className="space-y-4 bg-black/20 p-4.5 rounded-xl border border-white/5">
              <h3 className="text-xs font-black text-gray-300 flex items-center gap-1.5 mb-2 uppercase tracking-tight">
                <Settings className="w-4 h-4 text-[#FBBF24]" />
                Configurar Ajuste
              </h3>

              {/* Card Dropdown */}
              <div>
                <label className="text-[10px] text-gray-300 block font-mono font-bold uppercase mb-1">Seleccionar Carta</label>
                <select
                  id="select-adj-card"
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full bg-[#0F172A] text-gray-200 border-2 border-white/10 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#FBBF24]"
                >
                  {cards.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#0F172A] text-gray-200">
                      {c.name} ({c.hasEvolution ? "⚡ EVO" : "Carta"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Buff or Nerf Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-300 block font-mono font-bold uppercase mb-1">Sentido</label>
                  <div className="flex bg-[#0F172A] p-1 rounded-xl border-2 border-white/10">
                    <button
                      id="btn-toggle-buff"
                      onClick={() => setSelectedAdjType("buff")}
                      className={`flex-1 text-center py-1.5 text-xs rounded-lg transition-all font-black ${
                        selectedAdjType === "buff" ? "bg-[#10B981] text-black shadow-lg" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      BUFF
                    </button>
                    <button
                      id="btn-toggle-nerf"
                      onClick={() => setSelectedAdjType("nerf")}
                      className={`flex-1 text-center py-1.5 text-xs rounded-lg transition-all font-black ${
                        selectedAdjType === "nerf" ? "bg-[#EF4444] text-white shadow-lg" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      NERF
                    </button>
                  </div>
                </div>

                {/* Percentage Weight */}
                <div>
                  <label className="text-[10px] text-gray-300 block font-mono font-bold uppercase mb-1">Magnitud (%)</label>
                  <select
                    id="select-adj-percentage"
                    value={selectedPercentage}
                    onChange={(e) => setSelectedPercentage(Number(e.target.value))}
                    className="w-full bg-[#0F172A] text-gray-200 border-2 border-white/10 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#FBBF24]"
                  >
                    <option value={5} className="bg-[#0F172A]">5% (Microajuste)</option>
                    <option value={10} className="bg-[#0F172A]">10% (Estándar)</option>
                    <option value={15} className="bg-[#0F172A]">15% (Sensible)</option>
                    <option value={20} className="bg-[#0F172A]">20% (Macro cambio)</option>
                    <option value={25} className="bg-[#0F172A]">25% (Rework total)</option>
                  </select>
                </div>
              </div>

              {/* Add Button */}
              <button
                id="btn-add-adj"
                onClick={handleAddAdjustment}
                className="w-full py-3 bg-[#FBBF24] hover:bg-[#FBBF24]/90 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all duration-200 mt-4 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-[0.98]"
              >
                Agregar a Simulación
              </button>
            </div>
          </div>

          {/* Current Settings List */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-300">Ajustes a Simular:</span>
              {adjustments.length > 0 && (
                <button
                  id="btn-clear-all-adj"
                  onClick={handleClearAdjustments}
                  className="text-[10px] text-red-400 hover:text-red-300 font-mono font-bold uppercase tracking-wider"
                >
                  Limpiar lista
                </button>
              )}
            </div>

            {adjustments.length === 0 ? (
              <div className="py-8 bg-black/20 rounded-xl border-2 border-dashed border-white/5 text-center text-xs text-blue-100 italic">
                Agrega al menos una hipótesis (Buff/Nerf) de balance.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 select-scrollbar">
                {adjustments.map(adj => {
                  const card = cards.find(c => c.id === adj.cardId);
                  return (
                    <div
                      key={adj.cardId}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 text-xs font-sans"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            adj.type === "buff" ? "bg-[#10B981] animate-pulse" : "bg-[#EF4444] animate-pulse"
                          }`}
                        />
                        <span className="font-extrabold text-blue-100">{card?.name || adj.cardId}</span>
                        <span
                          className={`font-mono font-black uppercase text-[9px] px-2 py-0.5 rounded-md ${
                            adj.type === "buff" ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20" : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                          }`}
                        >
                          {adj.type} {adj.percentage}%
                        </span>
                      </div>

                      <button
                        id={`btn-remove-adj-${adj.cardId}`}
                        onClick={() => handleRemoveAdjustment(adj.cardId)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider px-1 cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {error && (
              <div className="mt-3 text-center text-xs font-mono font-bold text-red-400 bg-red-950/20 p-2.5 rounded-xl border border-red-500/20 shadow-inner">
                {error}
              </div>
            )}

            {/* Run Button */}
            <button
              id="btn-run-simulation"
              onClick={handleSimulate}
              disabled={adjustments.length === 0 || loading}
              className={`w-full mt-4 py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${
                adjustments.length > 0 && !loading
                  ? "bg-[#EF4444] hover:bg-[#EF4444]/90 text-white cursor-pointer shadow-red-600/15"
                  : "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1" />
                  Calculando Derivación Estratégica...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 ml-0.5 text-white fill-white" />
                  Ejecutar Deducción del Metajuego 2026
                </>
              )}
            </button>
          </div>
        </div>
        {/* Right column: Explanatory Background */}
        <div className="lg:col-span-7 bg-[#1E293B] border-2 border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-[#FBBF24] pb-3 border-b border-white/5 mb-4 uppercase tracking-tight italic">
              ¿Cómo funciona el Simulador de Balances?
            </h3>

            <div className="prose prose-invert text-xs space-y-4 text-gray-300 leading-relaxed">
              <p className="text-blue-100 font-sans leading-relaxed">
                El metajuego de Clash Royale es dinámico y altamente reactivo:
                un ajuste sobre una carta específica provoca una alteración colateral y en cascada sobre otras cartas y arquetipos.
              </p>
              
              <div className="bg-[#0F172A] p-4 border-2 border-white/5 rounded-2xl space-y-3 shadow-inner">
                <h4 className="text-[#FBBF24] font-black text-xs flex items-center gap-1.5 uppercase tracking-wide">
                  <CheckCircle className="w-4 h-4 text-[#FBBF24]" />
                  Ciclo Operativo del Simulador Neural:
                </h4>
                <ul className="space-y-2.5 list-none pl-1">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#FBBF24] font-black font-mono">01.</span>
                    <span className="text-blue-100"><strong>Perturbación Directa:</strong> Modifica el win-rate intrínseco de las cartas y evoluciones alteradas en base a la magnitud del cambio.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#FBBF24] font-black font-mono">02.</span>
                    <span className="text-blue-100"><strong>Respuesta Sistémica:</strong> El algoritmo recalcula indirectamente las tasas de uso de aquellas cartas comúnmente asociadas en un mismo mazo o arquetipo.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#FBBF24] font-black font-mono">03.</span>
                    <span className="text-blue-100"><strong>Análisis de Sinergias:</strong> Genera un reporte de balance asistido por inteligencia artificial para comprender el nuevo orden de popularidad.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 leading-relaxed">
              <strong className="text-red-400 font-black uppercase text-[10px] block tracking-wider mb-1">Nota del Modelo Predictivo:</strong> La predicción deduce cómo cambiará la popularidad (uso real) 
              e infiere si el juego se orientará a un metajuego defensivo / lento (tipo Control) o hiper-agresivo (tipo Beatdown).
            </div>
          </div>
        </div>
      </div>

      {/* Results block showing updated rates alongside dual-bar chart */}
      {result && (
        <div className="bg-[#1E293B] border-2 border-white/10 rounded-2xl p-6 shadow-2xl space-y-6" id="panel-patch-result">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
            <div>
              <span className="bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-mono px-2.5 py-1 rounded-md font-black uppercase tracking-wider">
                Simulación Completada
              </span>
              <h3 className="text-lg font-black text-[#FBBF24] mt-1.5 uppercase tracking-tight italic">
                Mutación Predictiva del Ecosistema 2026
              </h3>
            </div>

            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-gray-500 rounded-sm inline-block" /> Base 2026</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-400 rounded-sm inline-block" /> Simulado AI</span>
            </div>
          </div>

          {/* Bar Chart comparing baseline vs simulated rates */}
          <div className="bg-[#0F172A] border-2 border-white/5 rounded-2xl p-5 overflow-auto shadow-inner">
            <h4 className="text-xs font-black text-gray-400 mb-4 font-mono uppercase tracking-widest">Comparación de Tasa de Uso de Metajuego (%)</h4>
            
            <div className="space-y-4 col-span-12">
              {result.simulatedCards.filter(c => {
                // Prioritize displaying Adjusted cards + a few impacted ones
                const isAdj = result.adjustments.some(a => a.cardId === c.id);
                return isAdj || c.baselineUse > 12; // Adjusted or widely popular baseline cards
              }).map(c => {
                const maxPct = 40; // Max visual percentage scale
                const baselineW = Math.min((c.baselineUse / maxPct) * 100, 100);
                const simulatedW = Math.min((c.simulatedUse / maxPct) * 100, 100);

                const isAdjusted = result.adjustments.some(a => a.cardId === c.id);
                const isBuffed = isAdjusted && result.adjustments.find(a => a.cardId === c.id)?.type === "buff";
                const isNerfed = isAdjusted && result.adjustments.find(a => a.cardId === c.id)?.type === "nerf";

                const cardObject = cards.find(x => x.id === c.id);

                return (
                  <div key={c.id} className="grid grid-cols-12 items-center gap-3 text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                    {/* Card Label */}
                    <div className="col-span-3 font-black text-blue-100 truncate flex items-center gap-1.5">
                      {isBuffed && <span className="text-[#10B981] font-bold text-[10px]" title="Modificado Buff">▲</span>}
                      {isNerfed && <span className="text-[#EF4444] font-bold text-[10px]" title="Modificado Nerf">▼</span>}
                      {cardObject?.imgUrl && (
                        <img
                          src={cardObject.imgUrl}
                          alt={c.name}
                          className="w-5 h-6 object-contain rounded"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <span>{c.name}</span>
                    </div>

                    {/* Dual visual bars */}
                    <div className="col-span-7 space-y-1 relative py-1 border-l-2 border-white/10 pl-1.5">
                      {/* Baseline Bar */}
                      <div className="h-2 bg-gray-600/40 rounded-full relative" style={{ width: `${baselineW}%` }}>
                        <span className="absolute -right-8 -top-1 text-[8px] text-gray-400 font-mono font-bold">
                          {c.baselineUse}%
                        </span>
                      </div>
                      
                      {/* Simulated Bar */}
                      <div className="h-2.5 bg-[#EF4444] rounded-full relative shadow-md shadow-red-500/10" style={{ width: `${simulatedW}%` }}>
                        <span className="absolute -right-8 -top-0.5 text-[8.5px] text-red-300 font-mono font-black">
                          {c.simulatedUse}%
                        </span>
                      </div>
                    </div>

                    {/* Difference Label */}
                    <div className="col-span-2 text-right font-mono text-[10px] font-black">
                      {c.simulatedUse - c.baselineUse === 0 ? (
                        <span className="text-gray-500 font-medium">0.0%</span>
                      ) : c.simulatedUse - c.baselineUse > 0 ? (
                        <span className="text-[#10B981]">+{Number((c.simulatedUse - c.baselineUse).toFixed(1))}%</span>
                      ) : (
                        <span className="text-[#EF4444]">{Number((c.simulatedUse - c.baselineUse).toFixed(1))}%</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Deducted report explaining balance cascade effect */}
          <div className="bg-[#0F172A] border-2 border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 p-3 bg-red-500/10 text-red-400 rounded-bl-2xl border-l-2 border-b-2 border-white/5 flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider">
              <FileDiff className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>Deducción AI del Parche</span>
            </div>

            <div className="prose prose-invert max-w-none text-xs space-y-4 text-blue-100 font-sans mt-4">
              {renderMarkdown(result.aiDeduction)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
