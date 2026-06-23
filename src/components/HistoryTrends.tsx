import React, { useState } from "react";
import { Card } from "../types";
import { TrendingUp, Award, Layers, ShieldAlert, BarChart3, Clock } from "lucide-react";

interface Props {
  cards: Card[];
}

export default function HistoryTrends({ cards }: Props) {
  const [selectedCardId, setSelectedCardId] = useState<string>("mortar");
  const [compareCardIds, setCompareCardIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"cards" | "archetypes">("cards");

  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];

  const years = ["2023", "2024", "2025", "2026"];

  // Precomputed generic archetype historical meta data
  const archetypeHistory = {
    "Beatdown": [14.2, 12.5, 18.2, 16.5],
    "Log Bait": [18.5, 15.2, 22.4, 17.8],
    "Cycle": [22.1, 24.8, 20.3, 22.9],
    "Control": [19.2, 22.0, 18.5, 19.4],
    "Siege": [8.5, 12.0, 10.5, 11.2],
  };

  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

  const handleToggleCompare = (id: string) => {
    if (compareCardIds.includes(id)) {
      setCompareCardIds(compareCardIds.filter(x => x !== id));
    } else {
      if (compareCardIds.length >= 4) return; // Max 4 comparison lines
      setCompareCardIds([...compareCardIds, id]);
    }
  };

  const getPoints = (rates: number[], width: number, height: number): string => {
    const maxVal = 40; // max Y value of play rate
    const padding = 30;
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;

    return rates
      .map((rate, idx) => {
        const x = padding + (idx / (rates.length - 1)) * innerW;
        const y = padding + innerH - (rate / maxVal) * innerH;
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="bg-[#1E293B] border-2 border-white/10 rounded-2xl p-6 shadow-2xl" id="div-history-trends">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-black text-[#FBBF24] flex items-center gap-2 uppercase tracking-tight italic">
            <Clock className="w-6 h-6 text-[#FBBF24]" />
            Análisis de Patrones Temporales (2023 - 2026)
          </h2>
          <p className="text-blue-200 text-sm mt-1 font-sans">
            Visualiza cómo evolucionó el uso y efectividad de las cartas y arquetipos bajo el influjo de las mecánicas de Evoluciones.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-black/30 p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
          <button
            id="btn-tab-cards"
            onClick={() => setActiveTab("cards")}
            className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === "cards" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-md font-extrabold" : "text-gray-300 hover:text-white"
            }`}
          >
            Cartas Individuales
          </button>
          <button
            id="btn-tab-archetypes"
            onClick={() => setActiveTab("archetypes")}
            className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === "archetypes" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-md font-extrabold" : "text-gray-300 hover:text-white"
            }`}
          >
            Sinergia de Arquetipos
          </button>
        </div>
      </div>

      {activeTab === "cards" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Card list to select & compare */}
          <div className="lg:col-span-4 bg-black/20 border-2 border-white/5 rounded-2xl p-4 max-h-[500px] overflow-y-auto">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-300 mb-4 px-2 flex items-center justify-between">
              <span>Selecciona una mazo:</span>
              <span className="text-[10px] text-[#FBBF24] font-mono">Max 4 para comparar</span>
            </h3>

            <div className="space-y-1.5">
              {cards.map(c => {
                const isSelected = selectedCardId === c.id;
                const isCompared = compareCardIds.includes(c.id);

                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-sm ${
                      isSelected
                        ? "bg-[#FBBF24]/10 border-[#FBBF24] text-white"
                        : "bg-transparent border-transparent hover:bg-white/5 text-gray-300"
                    }`}
                  >
                    <button
                      id={`btn-select-card-${c.id}`}
                      onClick={() => {
                        setSelectedCardId(c.id);
                        if (compareCardIds.includes(c.id)) {
                          setCompareCardIds(compareCardIds.filter(x => x !== c.id));
                        }
                      }}
                      className="flex-1 text-left font-semibold truncate uppercase"
                    >
                      <div className="flex items-center gap-2">
                        {c.imgUrl && (
                          <img
                            src={c.imgUrl}
                            alt={c.name}
                            className="w-5 h-6 object-contain rounded"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        {c.hasEvolution && (
                          <span className="bg-purple-600 border border-purple-400 text-white text-[8px] px-1.5 py-0.5 rounded font-mono font-black">
                            EVO
                          </span>
                        )}
                        <span>{c.name}</span>
                        <span className="text-[11px] text-gray-500 font-bold font-mono">({c.elixir}🧪)</span>
                      </div>
                    </button>

                    <button
                      id={`btn-compare-card-${c.id}`}
                      onClick={() => handleToggleCompare(c.id)}
                      disabled={isSelected}
                      className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg border font-mono transition-all cursor-pointer ${
                        isSelected
                          ? "opacity-30 cursor-not-allowed text-gray-500 border-transparent bg-transparent"
                          : isCompared
                          ? "bg-blue-600/20 text-blue-400 border-blue-500 shadow"
                          : "bg-slate-800 text-slate-300 border-white/5 hover:text-white"
                      }`}
                    >
                      {isCompared ? "Remover" : "Comparar"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Line Chart Component & Metrics */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {/* Legend Indicators */}
            <div className="flex flex-wrap items-center gap-4 mb-4 bg-black/30 p-3.5 rounded-xl border border-white/10">
              <span className="flex items-center gap-1.5 text-xs text-[#FBBF24] font-black uppercase">
                {selectedCard.imgUrl && (
                  <img
                    src={selectedCard.imgUrl}
                    alt={selectedCard.name}
                    className="w-6 h-7 object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="w-3 h-3 rounded-full bg-[#FBBF24] inline-block pointer-events-none" />
                <strong> {selectedCard.name} (Tasa de Uso)</strong>
              </span>

              {compareCardIds.map((id, index) => {
                const compCard = cards.find(c => c.id === id);
                if (!compCard) return null;
                return (
                  <span key={id} className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: colors[index % colors.length] }}>
                    {compCard.imgUrl && (
                      <img
                        src={compCard.imgUrl}
                        alt={compCard.name}
                        className="w-6 h-7 object-contain rounded"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: colors[index % colors.length] }} />
                    {compCard.name}
                  </span>
                );
              })}
            </div>

            {/* Custom SVG Responsive Line Chart */}
            <div className="relative bg-[#0F172A] border-2 border-white/10 rounded-2xl p-5 overflow-hidden shadow-inner">
              <span className="absolute top-2 right-4 text-[9px] font-mono text-blue-200 uppercase font-black">Eje Y: Tasa de Uso (%)</span>
              <svg className="w-full h-64" viewBox="0 0 500 240">
                {/* Horizontal grid lines */}
                {[0, 10, 20, 30, 40].map((val, idx) => {
                  const y = 30 + (180 - (val / 40) * 180);
                  return (
                    <g key={idx}>
                      <line x1="30" y1={y} x2="470" y2={y} stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="5" y={y + 4} fill="#64748B" className="text-[10px] font-mono font-bold">
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Years */}
                {years.map((year, idx) => {
                  const x = 30 + (idx / 3) * 440;
                  return (
                    <text key={idx} x={x} y="228" fill="#94A3B8" textAnchor="middle" className="text-[10px] font-mono font-black">
                      {year}
                    </text>
                  );
                })}

                {/* Main Card Play Rate Line */}
                <polyline
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getPoints(
                    [
                      selectedCard.stats2023.useRate,
                      selectedCard.stats2024.useRate,
                      selectedCard.stats2025.useRate,
                      selectedCard.stats2026.useRate,
                    ],
                    500,
                    240
                  )}
                />

                {/* Main Card Line Nodes */}
                {[
                  selectedCard.stats2023.useRate,
                  selectedCard.stats2024.useRate,
                  selectedCard.stats2025.useRate,
                  selectedCard.stats2026.useRate,
                ].map((rate, idx) => {
                  const x = 30 + (idx / 3) * 440;
                  const y = 30 + 180 - (rate / 40) * 180;
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="5" fill="#FBBF24" stroke="#0F172A" strokeWidth="2" />
                      <text x={x} y={y - 10} fill="#FFF" textAnchor="middle" className="text-[10px] font-mono font-black">
                        {rate}%
                      </text>
                    </g>
                  );
                })}

                {/* Compare Lines */}
                {compareCardIds.map((compareId, lineIdx) => {
                  const c = cards.find(x => x.id === compareId);
                  if (!c) return null;
                  const linePoints = [c.stats2023.useRate, c.stats2024.useRate, c.stats2025.useRate, c.stats2026.useRate];
                  const color = colors[lineIdx % colors.length];

                  return (
                    <g key={compareId}>
                      <polyline
                        fill="none"
                        stroke={color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={getPoints(linePoints, 500, 240)}
                      />
                      {linePoints.map((rate, idx) => {
                        const x = 30 + (idx / 3) * 440;
                        const y = 30 + 180 - (rate / 40) * 180;
                        return (
                          <circle key={idx} cx={x} cy={y} r="3.5" fill={color} stroke="#0F172A" strokeWidth="1.5" />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick Card Metrics / Evolution Analysis block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-black/20 p-4 border border-white/5 rounded-xl flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#FBBF24]/10 text-[#FBBF24]">
                  <TrendingUp className="w-5 h-5 text-[#FBBF24]" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-mono uppercase font-bold">Use Rate 2026</span>
                  <span className="text-lg font-black text-white italic tracking-tight font-display">{selectedCard.stats2026.useRate}%</span>
                </div>
              </div>

              <div className="bg-black/20 p-4 border border-white/5 rounded-xl flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-500/10 text-green-500">
                  <Award className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-mono uppercase font-bold">Win Rate 2026</span>
                  <span className="text-lg font-black text-white italic tracking-tight font-display">{selectedCard.stats2026.winRate}%</span>
                </div>
              </div>

              <div className="bg-black/20 p-4 border border-white/5 rounded-xl flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Layers className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-mono uppercase font-bold">Evoluciones</span>
                  <span className="text-xs font-black text-purple-300 uppercase tracking-tight">
                    {selectedCard.hasEvolution
                      ? `Lanzada en ${selectedCard.evolutionYear}`
                      : "No habilitada aún"}
                  </span>
                </div>
              </div>
            </div>

            {selectedCard.hasEvolution && (
              <div className="mt-4 p-4.5 bg-[#9333EA]/10 border-2 border-[#9333EA]/30 rounded-xl text-sm flex items-start gap-3">
                <span className="text-lg">💡</span>
                <p className="text-purple-200 text-xs font-sans">
                  <strong>Efecto Evolución ({selectedCard.evolutionYear}):</strong> La introducción de la evolución de 
                  this card causó un pico abrupto en la tasa de victorias (+{Number((selectedCard.stats2024.winRate - selectedCard.stats2023.winRate).toFixed(1))}% de 2023 a 2024), 
                  marcando el ritmo de la CRL (Clash Royale League).
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#1E293B] border-2 border-white/5 rounded-2xl p-5 shadow-inner">
              <h3 className="text-base font-black text-[#FBBF24] mb-3 flex items-center gap-2 uppercase tracking-tight italic">
                <BarChart3 className="w-5 h-5 text-[#FBBF24]" />
                Dinámica de Arquetipos
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed mb-4">
                Los arquetipos representan combinaciones de sinergias matemáticas extremas entre 8 cartas de un total 
                de más de 115 opciones.
              </p>

              <div className="space-y-3">
                <div className="text-xs">
                  <span className="font-bold text-[#FBBF24] block uppercase text-[10px] tracking-wider">Cycle (Mazo rápido)</span>: Se enfoca en ciclar tan rápido que el adversario no tiene sus defensas listas.
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#FBBF24] block uppercase text-[10px] tracking-wider">Beatdown</span>: Construcción de ataques gigantescos acumulando elixir desde atrás.
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#FBBF24] block uppercase text-[10px] tracking-wider">Log Bait</span>: Provocar el uso de hechizos defensivos rivales para luego castigar con barriles.
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 border-2 border-red-500/25 rounded-2xl p-4.5 flex gap-3 text-xs text-red-300">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-400 font-black" />
              <div>
                <strong className="text-red-400 font-black uppercase text-[10px] block tracking-wide mb-1">Sinergias No Lineales:</strong> El metajuego cambia mensualmente impulsado por balances en balance. 
                Los picos reflejan cambios drásticos capturados por el modelo LSTM.
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-between">
            <h4 className="text-xs font-black text-gray-400 mb-3 font-mono uppercase tracking-widest">Tasa de Uso por Arquetipo Principal (2023 - 2026)</h4>

            <div className="relative bg-[#0F172A] border-2 border-white/10 rounded-2xl p-5 overflow-hidden shadow-inner">
              <svg className="w-full h-64" viewBox="0 0 500 240">
                {/* Horizontal scale */}
                {[0, 10, 20, 30].map((val, idx) => {
                  const y = 30 + (180 - (val / 30) * 180);
                  return (
                    <g key={idx}>
                      <line x1="30" y1={y} x2="470" y2={y} stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="5" y={y + 4} fill="#64748B" className="text-[10px] font-mono font-bold">
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* X Axis */}
                {years.map((year, idx) => {
                  const x = 30 + (idx / 3) * 440;
                  return (
                    <text key={idx} x={x} y="228" fill="#94A3B8" textAnchor="middle" className="text-[10px] font-mono font-black">
                      {year}
                    </text>
                  );
                })}

                {/* Plot Archetype Play Rate lines */}
                {Object.entries(archetypeHistory).map(([arch, rates], lineIdx) => {
                  const color = colors[lineIdx % colors.length];
                  return (
                    <g key={arch}>
                      <polyline
                        fill="none"
                        stroke={color}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={rates
                          .map((rate, idx) => {
                            const x = 30 + (idx / 3) * 440;
                            const y = 30 + 180 - (rate / 30) * 180;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />
                      {rates.map((rate, idx) => {
                        const x = 30 + (idx / 3) * 440;
                        const y = 30 + 180 - (rate / 30) * 180;
                        return (
                          <circle key={idx} cx={x} cy={y} r="3.5" fill={color} stroke="#0F172A" strokeWidth="1.5" />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Labels under chart */}
            <div className="flex flex-wrap gap-4 mt-5 justify-center bg-black/25 p-3 rounded-xl border border-white/5">
              {Object.keys(archetypeHistory).map((arch, lineIdx) => (
                <span key={arch} className="flex items-center gap-2 text-xs font-black uppercase tracking-tight">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[lineIdx % colors.length] }} />
                  <span className="text-gray-300 font-display">{arch}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
