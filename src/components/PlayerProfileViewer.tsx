import React, { useState } from "react";
import { 
  Search, Trophy, Users, CheckCircle, Calendar, 
  TrendingUp, Sparkles, Coins, Info, X, Swords 
} from "lucide-react";
import { Card, PlayerProfile, PlayerCard } from "../types";

interface Props {
  cards: Card[];
}

export default function PlayerProfileViewer({ cards: allCards }: Props) {
  const [playerTag, setPlayerTag] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [activeCollectionTab, setActiveCollectionTab] = useState<string>("all");

  const searchProfile = async (tagToSearch: string) => {
    if (!tagToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const cleanTag = tagToSearch.trim().replace("#", "");
      const res = await fetch(`/api/clash/player/${cleanTag}`);
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setProfile(data.profile);
        setPlayerTag(data.profile.tag);
      } else {
        setError(data.message || "No se pudo encontrar el jugador. Verifica el TAG.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión al buscar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchProfile(playerTag);
  };

  // Helper to match player card state with assets/metadata from global list
  const getCardDetails = (playerCard: PlayerCard): Card | undefined => {
    return allCards.find(c => c.id === playerCard.id);
  };

  // Filter and sort collection cards
  const getFilteredCollection = (): PlayerCard[] => {
    if (!profile) return [];
    
    return profile.cards.filter(pc => {
      const details = getCardDetails(pc);
      if (!details) return true;
      if (activeCollectionTab === "all") return true;
      return details.type === activeCollectionTab;
    }).sort((a, b) => b.level - a.level || b.count - a.count);
  };

  // Calculate SVGs coordinate points for historical trophies progression chart
  const getSvgPathPoints = (history: { season: string; trophies: number }[]): string => {
    if (history.length === 0) return "";
    const minVal = Math.min(...history.map(h => h.trophies)) - 100;
    const maxVal = Math.max(...history.map(h => h.trophies)) + 100;
    const valRange = maxVal - minVal || 1;

    const width = 600;
    const height = 150;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 20;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    return history.map((h, i) => {
      const x = paddingLeft + (i / (history.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((h.trophies - minVal) / valRange) * chartHeight;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  const getSvgDotsAndLabels = (history: { season: string; trophies: number }[]) => {
    if (history.length === 0) return null;
    const minVal = Math.min(...history.map(h => h.trophies)) - 100;
    const maxVal = Math.max(...history.map(h => h.trophies)) + 100;
    const valRange = maxVal - minVal || 1;

    const width = 600;
    const height = 150;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 20;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    return history.map((h, i) => {
      const x = paddingLeft + (i / (history.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((h.trophies - minVal) / valRange) * chartHeight;
      
      return (
        <g key={i} className="group/dot">
          <circle
            cx={x}
            cy={y}
            r="4"
            className="fill-[#FBBF24] stroke-[#1E293B] stroke-2 hover:r-6 hover:fill-white transition-all cursor-pointer"
          />
          {/* Tooltip on hover */}
          <text
            x={x}
            y={y - 10}
            textAnchor="middle"
            className="fill-white text-[9px] font-mono font-bold bg-[#0F172A] opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none"
          >
            {h.trophies} 🏆
          </text>
        </g>
      );
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="container-player-profile">
      
      {/* Search and Quick Load Banner */}
      <div className="bg-gradient-to-r from-[#1E40AF]/30 via-[#1E293B] to-[#1E40AF]/30 border-2 border-[#FBBF24] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FBBF24]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-display font-black tracking-tight text-white uppercase italic flex items-center justify-center gap-2">
            <Search className="w-5 h-5 text-[#FBBF24]" />
            Buscador de Perfiles de Jugador
          </h2>
          <p className="text-xs text-blue-200 font-sans max-w-md mx-auto">
            Ingresa el TAG de un jugador para consultar su nivel de tropas, historial competitivo y proyecciones de copas con IA.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mx-auto mt-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-gray-500 font-mono font-bold text-xs select-none">#</span>
              <input
                type="text"
                placeholder="TAG de jugador (ej: 9PJ92R0Y)"
                value={playerTag}
                onChange={(e) => setPlayerTag(e.target.value)}
                className="w-full bg-[#0F172A]/90 text-gray-200 border border-white/10 rounded-xl pl-6 pr-3 py-2 text-xs focus:outline-none focus:border-[#FBBF24] uppercase font-mono tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !playerTag.trim()}
              className="px-5 bg-[#FBBF24] hover:bg-amber-400 disabled:bg-white/5 disabled:text-gray-500 text-[#1E3A8A] text-xs font-black uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg border border-white/10"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#1E3A8A] border-t-transparent" />
              ) : (
                "Buscar"
              )}
            </button>
          </form>

          {/* Quick Buttons */}
          <div className="flex flex-wrap gap-2 justify-center items-center pt-2">
            <span className="text-[10px] text-gray-400 uppercase font-mono">Demos rápidas:</span>
            <button
              onClick={() => searchProfile("9PJ92R0Y")}
              className="px-3 py-1 bg-blue-950/60 hover:bg-blue-900 border border-blue-800/40 text-blue-300 text-[10px] font-mono font-bold rounded-lg cursor-pointer transition-all"
            >
              Surgical Goblin (#9PJ92R0Y)
            </button>
            <button
              onClick={() => searchProfile("C0G2Y2")}
              className="px-3 py-1 bg-red-950/60 hover:bg-red-900 border border-red-800/40 text-red-300 text-[10px] font-mono font-bold rounded-lg cursor-pointer transition-all"
            >
              Morten (#C0G2Y2)
            </button>
            <button
              onClick={() => searchProfile("BARAJA")}
              className="px-3 py-1 bg-amber-950/60 hover:bg-amber-900 border border-amber-800/40 text-amber-300 text-[10px] font-mono font-bold rounded-lg cursor-pointer transition-all"
            >
              Baraja Pro (#BARAJA)
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl max-w-md mx-auto text-center text-xs text-red-300 flex items-center justify-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Profile Details View */}
      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDE: SUMMARY CARD & CURRENT DECK */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Player Main Info */}
            <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-[#FBBF24]/10 text-[#FBBF24] rounded-bl-2xl font-mono text-[9px] font-bold uppercase tracking-wider">
                Nivel {profile.expLevel}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-display font-black text-white uppercase italic tracking-tight">
                    {profile.name}
                  </h3>
                  <span className="text-[10px] font-mono text-[#FBBF24] block">{profile.tag}</span>
                  {profile.clan && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-blue-300 font-sans">
                      <Users className="w-3 h-3 text-blue-400" />
                      Clan: {profile.clan.name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  <div className="bg-black/20 p-2.5 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="text-[9px] font-mono text-gray-400 uppercase">Copas</span>
                    <span className="text-sm font-black text-[#FBBF24] font-mono flex items-center gap-1 mt-0.5">
                      <Trophy className="w-4 h-4 text-[#FBBF24]" />
                      {profile.trophies}
                    </span>
                  </div>
                  <div className="bg-black/20 p-2.5 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="text-[9px] font-mono text-gray-400 uppercase">Máximo Récord</span>
                    <span className="text-sm font-black text-white font-mono flex items-center gap-1 mt-0.5">
                      <Trophy className="w-4 h-4 text-gray-400" />
                      {profile.bestTrophies}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5 text-[10px] font-mono">
                  <div className="flex justify-between text-gray-300">
                    <span>Victorias Totales:</span>
                    <span className="text-white font-black">{profile.wins}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Derrotas:</span>
                    <span className="text-white font-black">{profile.losses}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Winrate Global:</span>
                    <span className="text-green-400 font-black">
                      {((profile.wins / ((profile.wins + profile.losses) || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Victorias de 3 Coronas:</span>
                    <span className="text-amber-400 font-black">{profile.threeCrownWins} 👑</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Victorias de Guerra:</span>
                    <span className="text-purple-400 font-black">{profile.warDayWins} ⚔️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Deck Card */}
            <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-5 shadow-xl">
              <h4 className="text-xs font-display font-black text-white uppercase italic tracking-wider mb-3 flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-blue-400" />
                Mazo en Uso
              </h4>

              <div className="grid grid-cols-4 gap-2">
                {profile.currentDeck.map(pc => {
                  const details = getCardDetails(pc);
                  return (
                    <div 
                      key={pc.id}
                      className="bg-black/30 rounded-xl p-1 border border-white/5 relative flex flex-col items-center justify-between aspect-[3/4] overflow-hidden group"
                    >
                      {/* Elixir / Level indicators */}
                      <span className="absolute top-0.5 left-0.5 bg-black/60 px-1 rounded font-mono text-[7px] text-gray-300 leading-none">
                        Lvl {pc.level}
                      </span>
                      {details?.hasEvolution && (
                        <span className="absolute top-0.5 right-0.5 bg-purple-600 text-white text-[6px] font-bold px-0.5 rounded font-mono leading-none border border-white/10 z-10">
                          EVO
                        </span>
                      )}

                      {details?.imgUrl ? (
                        <img 
                          src={details.imgUrl} 
                          alt={pc.name}
                          className="w-8 h-10 object-contain mt-1 drop-shadow-md group-hover:scale-105 transition-all"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-10 bg-white/5 rounded flex items-center justify-center text-[8px] font-black mt-1">
                          CR
                        </div>
                      )}

                      <p className="text-[7px] text-gray-300 truncate w-full text-center px-0.5 select-none font-bold uppercase">
                        {pc.name}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/5 text-center">
                <span className="text-[9px] font-mono text-gray-400">
                  Costo Elixir Promedio: {(profile.currentDeck.reduce((sum, pc) => sum + (getCardDetails(pc)?.elixir || 0), 0) / 8).toFixed(1)} 💧
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: HISTORY CHART, AI PROJECTIONS & COLLECTION */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* SVG Historical Progression Chart & AI Forecast */}
            <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-5 shadow-xl">
              <h4 className="text-xs font-display font-black text-white uppercase italic tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#FBBF24]" />
                Historial y Proyección de Rendimiento IA
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* SVG Graph */}
                <div className="md:col-span-7 bg-black/20 p-3 rounded-2xl border border-white/5 flex flex-col justify-between overflow-x-auto">
                  <span className="text-[9px] text-gray-400 font-mono uppercase tracking-widest mb-2 block">
                    Progreso de Copas (Últimas 6 Temporadas)
                  </span>

                  <svg viewBox="0 0 600 150" className="w-full h-auto min-w-[300px]">
                    {/* Background Grid Lines */}
                    <line x1="40" y1="20" x2="580" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="40" y1="57.5" x2="580" y2="57.5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="40" y1="95" x2="580" y2="95" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="40" y1="130" x2="580" y2="130" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                    {/* Chart Line Path */}
                    <path
                      d={getSvgPathPoints(profile.history)}
                      fill="none"
                      stroke="url(#trophyGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Gradient Definition */}
                    <defs>
                      <linearGradient id="trophyGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="50%" stopColor="#9333EA" />
                        <stop offset="100%" stopColor="#FBBF24" />
                      </linearGradient>
                    </defs>

                    {/* Dots and Labels */}
                    {getSvgDotsAndLabels(profile.history)}
                  </svg>

                  <div className="flex justify-between text-[7px] font-mono text-gray-500 mt-2 px-6">
                    <span>T32 (Oct)</span>
                    <span>T33</span>
                    <span>T34</span>
                    <span>T35</span>
                    <span>T36</span>
                    <span>T37 (Mar 2026)</span>
                  </div>
                </div>

                {/* Projections Info */}
                <div className="md:col-span-5 space-y-3.5">
                  <div className="bg-black/30 p-3 rounded-2xl border border-[#FBBF24]/20 relative">
                    <span className="absolute top-2.5 right-3 text-[#FBBF24] flex items-center gap-0.5 text-[8px] font-mono font-black uppercase bg-[#FBBF24]/10 px-1.5 py-0.5 rounded border border-[#FBBF24]/20 animate-pulse">
                      <Sparkles className="w-3 h-3 text-[#FBBF24]" />
                      IA Predice
                    </span>

                    <h5 className="text-[10px] font-mono font-bold text-gray-300 uppercase mb-2">Próximas Copas Estimadas</h5>
                    <div className="space-y-1.5 font-mono text-xs">
                      {profile.projections.nextSeasons.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-400">{s.season.split(" ")[1]}:</span>
                          <span className="font-black text-[#FBBF24] flex items-center gap-0.5">
                            {s.predictedTrophies} 🏆
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Account Resource projection */}
                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                    <h5 className="text-[10px] font-mono font-bold text-gray-300 uppercase mb-2 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-yellow-500" />
                      Progreso de Recursos de Cuenta
                    </h5>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 mb-1">
                          <span>Maxeo de Colección:</span>
                          <span className="text-white font-bold">{profile.projections.completionPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${profile.projections.completionPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between text-[9px] font-mono text-gray-400">
                        <span>Oro requerido estimado:</span>
                        <span className="text-yellow-500 font-bold">
                          {profile.projections.goldNeeded.toLocaleString()} 🪙
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Synergy Deck Recommendation based on Level */}
            <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <h4 className="text-xs font-display font-black text-white uppercase italic tracking-wider mb-2 flex items-center gap-1.5 z-10 relative">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Mazo Sugerido por IA para Competir
              </h4>
              <p className="text-[9px] text-gray-300 font-sans mb-4 z-10 relative leading-normal">
                Basándonos en las cartas de mayor nivel en tu colección, la IA ha estructurado un mazo viable con el mejor balance de win-rate del metajuego actual.
              </p>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 z-10 relative">
                {profile.projections.recommendedDeck.map(cardId => {
                  const cardDetails = allCards.find(c => c.id === cardId);
                  return (
                    <div 
                      key={cardId} 
                      className="bg-black/30 p-1.5 rounded-2xl border border-white/5 flex flex-col items-center justify-between aspect-[3/4] overflow-hidden group hover:border-purple-500/30 transition-all"
                    >
                      <span className="bg-purple-950/60 text-purple-300 font-mono text-[8px] font-black px-1.5 rounded-full border border-purple-800/30">
                        {cardDetails?.elixir || 0}💧
                      </span>

                      {cardDetails?.imgUrl ? (
                        <img 
                          src={cardDetails.imgUrl} 
                          alt={cardDetails.name}
                          className="w-10 h-12 object-contain my-1.5 drop-shadow-md group-hover:scale-105 transition-all"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-12 bg-white/5 rounded flex items-center justify-center text-[9px] text-gray-500">
                          ?
                        </div>
                      )}

                      <p className="text-[7.5px] text-white text-center font-black truncate w-full uppercase leading-none mb-1">
                        {cardDetails?.name || cardId}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complete Card Collection Levels Grid */}
            <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                <div>
                  <h4 className="text-xs font-display font-black text-white uppercase italic tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-400" />
                    Colección de Tropas y Niveles
                  </h4>
                  <p className="text-[9px] text-gray-400 font-sans mt-0.5">
                    Ordenado por nivel. Pulsa los filtros para ver categorías específicas.
                  </p>
                </div>

                {/* Filter controls */}
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 text-[9px] self-start sm:self-auto font-mono">
                  <button
                    onClick={() => setActiveCollectionTab("all")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeCollectionTab === "all" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setActiveCollectionTab("tropa")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeCollectionTab === "tropa" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Tropas
                  </button>
                  <button
                    onClick={() => setActiveCollectionTab("hechizo")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeCollectionTab === "hechizo" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Hechizos
                  </button>
                  <button
                    onClick={() => setActiveCollectionTab("estructura")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeCollectionTab === "estructura" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Estructuras
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {getFilteredCollection().map(pc => {
                  const details = getCardDetails(pc);
                  const isMaxed = pc.level === pc.maxLevel;
                  
                  return (
                    <div
                      key={pc.id}
                      className={`p-2 bg-black/20 rounded-2xl border flex flex-col items-center justify-between h-[85px] relative group overflow-hidden ${
                        isMaxed ? "border-amber-500/20 bg-amber-950/5" : "border-white/5"
                      }`}
                    >
                      {/* Level Tag */}
                      <span className={`absolute top-1 left-1 font-mono text-[7px] px-1 rounded font-black ${
                        isMaxed ? "bg-amber-500 text-black" : "bg-black/60 text-gray-300"
                      }`}>
                        {isMaxed ? "MAX" : `Nivel ${pc.level}`}
                      </span>

                      {details?.imgUrl ? (
                        <img 
                          src={details.imgUrl} 
                          alt={pc.name}
                          className="w-7 h-9 object-contain mt-3.5 drop-shadow group-hover:scale-105 transition-all"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-9 mt-3.5 flex items-center justify-center text-[7px] text-gray-500">
                          ?
                        </div>
                      )}

                      <span className="text-[7px] font-mono text-gray-400 block truncate w-full text-center px-0.5 mt-1 select-none leading-none">
                        {pc.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Zero State Profile Search */}
      {!profile && !loading && (
        <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-16 text-center shadow-xl space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#FBBF24]/10 rounded-full flex items-center justify-center text-3xl mx-auto border border-[#FBBF24]/10">
            🔍
          </div>
          <h3 className="text-base font-display font-black text-white uppercase italic">
            Esperando Consulta de TAG
          </h3>
          <p className="text-xs text-gray-400 leading-normal max-w-xs mx-auto">
            Por favor, escribe un TAG de Clash Royale en la barra superior o haz clic en uno de los accesos rápidos para cargar un perfil y ver su analítica completa.
          </p>
        </div>
      )}

    </div>
  );
}
