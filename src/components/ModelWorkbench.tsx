import React, { useEffect, useState } from "react";
import { ModelMetricsData } from "../types";
import { Cpu, Award, TrendingDown, Layers, HelpCircle, Activity, Sparkles } from "lucide-react";

export default function ModelWorkbench() {
  const [metrics, setMetrics] = useState<ModelMetricsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeModel, setActiveModel] = useState<"lstm" | "rf">("lstm");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/clash/model-metrics");
        const data = await response.json();
        if (response.ok && data.status === "success") {
          setMetrics(data.data);
        }
      } catch (err) {
        console.error("Error loading model workbench metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-[#111827] rounded-2xl border border-[#374151]" id="loading-workbench">
        <span className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-4" />
        <p className="text-gray-400 text-sm">Cargando hiperparámetros de los modelos de IA...</p>
      </div>
    );
  }

  // Draw SVG points for clean neural training curves
  const getCurvePoints = (data: { epoch: number; trainLoss: number; valLoss: number }[], field: "trainLoss" | "valLoss") => {
    const width = 450;
    const height = 180;
    const padding = 20;

    const maxLoss = 0.5; // Scale of Loss values
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;

    return data
      .map((item, idx) => {
        const x = padding + (idx / (data.length - 1)) * innerW;
        const loss = field === "trainLoss" ? item.trainLoss : item.valLoss;
        const y = padding + innerH - (loss / maxLoss) * innerH;
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="bg-[#1E293B] border-2 border-white/10 rounded-2xl p-6 shadow-2xl space-y-8" id="container-model-workbench">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-display font-black text-[#FBBF24] uppercase tracking-tight italic flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#FBBF24]" />
            Laboratorio de Métricas de IA (LSTM vs Random Forest)
          </h2>
          <p className="text-xs text-blue-200 font-sans mt-0.5">
            Analiza de forma técnica la precisión, el error cuadrático y los pesos de las variables calculadas por los modelos.
          </p>
        </div>

        {/* Model quick selections */}
        <div className="flex bg-black/30 p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
          <button
            id="btn-select-lstm"
            onClick={() => setActiveModel("lstm")}
            className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeModel === "lstm" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-md" : "text-gray-300 hover:text-white"
            }`}
          >
            Memoria Temporal (LSTM)
          </button>
          <button
            id="btn-select-rf"
            onClick={() => setActiveModel("rf")}
            className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeModel === "rf" ? "bg-[#FBBF24] text-[#1E3A8A] shadow-md" : "text-gray-300 hover:text-white"
            }`}
          >
            Bosques Aleatorios
          </button>
        </div>
      </div>

      {/* Accuracy stats cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black/20 p-4 border border-white/5 rounded-xl text-center">
          <span className="text-[10px] text-gray-400 font-mono block uppercase">Exactitud General (Accuracy)</span>
          <span className="text-2xl font-black font-display text-white mt-1 block italic tracking-tight">
            {activeModel === "lstm" ? metrics.lstm.metrics.accuracy : metrics.randomForest.metrics.accuracy}%
          </span>
          <span className="text-[8px] text-gray-500 block mt-0.5">Dirección de tendencias</span>
        </div>

        <div className="bg-black/20 p-4 border border-white/5 rounded-xl text-center">
          <span className="text-[10px] text-gray-400 font-mono block uppercase">Precisión (Métrica de eSports)</span>
          <span className="text-2xl font-black font-display text-white mt-1 block italic tracking-tight">
            {activeModel === "lstm" ? metrics.lstm.metrics.precision : metrics.randomForest.metrics.precision}%
          </span>
          <span className="text-[8px] text-gray-500 block mt-0.5">Evaluación Tier Lists</span>
        </div>

        <div className="bg-black/20 p-4 border border-white/5 rounded-xl text-center">
          <span className="text-[10px] text-gray-400 font-mono block uppercase font-black text-[#FBBF24]">Error Cuadrático Medio (MSE)</span>
          <span className="text-2xl font-mono font-black text-amber-400 mt-1 block italic tracking-tight">
            {activeModel === "lstm" ? metrics.lstm.metrics.mse : metrics.randomForest.metrics.mse}
          </span>
          <span className="text-[8px] text-gray-500 block mt-0.5">Varianza de simulación</span>
        </div>

        <div className="bg-black/20 p-4 border border-white/5 rounded-xl text-center">
          <span className="text-[10px] text-gray-400 font-mono block uppercase font-black text-purple-400">Error Absoluto Medio (MAE)</span>
          <span className="text-2xl font-mono font-black text-purple-400 mt-1 block italic tracking-tight">
            {activeModel === "lstm" ? metrics.lstm.metrics.mae : metrics.randomForest.metrics.mae}
          </span>
          <span className="text-[8px] text-gray-500 block mt-0.5">Error medio de predicción</span>
        </div>
      </div>

      {/* Model explanation & Graphics area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side Info block */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-[#FBBF24] uppercase font-mono tracking-widest">
            Descripción Técnica del Modelo Seleccionado
          </h3>
          <p className="text-xs text-blue-100 leading-relaxed bg-[#0F172A] p-4 border border-white/5 rounded-xl">
            {activeModel === "lstm" ? metrics.lstm.description : metrics.randomForest.description}
          </p>

          <div className="bg-[#FBBF24]/5 border-2 border-[#FBBF24]/30 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-black text-[#FBBF24] uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#FBBF24]" />
              Observaciones De Rendimiento del Modelo
            </h4>
            <p className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
              El modelo **LSTM** presenta un error residual significativamente menor ({metrics.lstm.metrics.mse}) 
              para capturar fluctuaciones temporales de uso. Por su parte, el modelo **Random Forest** es ideal para 
              evaluar el peso empírico de cada atributo del juego por separado de forma rápida y directa.
            </p>
          </div>
        </div>

        {/* Right Side Graphics block depending on active model selection */}
        <div>
          {activeModel === "lstm" ? (
            <div className="bg-[#0F172A] border-2 border-white/10 rounded-xl p-5 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider">Historial del Entrenamiento (Función de Pérdida)</h4>
                <div className="text-[9px] font-mono text-gray-400 flex gap-4">
                  <span className="text-blue-400 font-bold">• Entrenamiento</span>
                  <span className="text-red-400 font-bold">• Validación</span>
                </div>
              </div>

              <div className="relative">
                <svg className="w-full h-44" viewBox="0 0 450 180">
                  {/* Axis lines */}
                  {[0.1, 0.2, 0.3, 0.4, 0.5].map((val, idx) => {
                    const y = 20 + 140 - (val / 0.5) * 140;
                    return (
                      <g key={idx}>
                        <line x1="20" y1={y} x2="430" y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                        <text x="0" y={y + 3} fill="#94A3B8" className="text-[9px] font-mono">
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  <line x1="20" y1="160" x2="430" y2="160" stroke="#475569" strokeWidth="1" />

                  {/* Epoch marks */}
                  {[0, 4, 9, 14].map((epochIdx) => {
                    const x = 20 + (epochIdx / 14) * 410;
                    return (
                      <text key={epochIdx} x={x} y="174" fill="#64748B" textAnchor="middle" className="text-[9px] font-mono">
                        Epoca {epochIdx + 1}
                      </text>
                    );
                  })}

                  {/* Draw Training Loss Curve */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    points={getCurvePoints(metrics.lstm.epochs, "trainLoss")}
                  />

                  {/* Draw Validation Loss Curve */}
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    points={getCurvePoints(metrics.lstm.epochs, "valLoss")}
                  />
                </svg>
              </div>
              <p className="text-[9px] text-[#94A3B8] text-center mt-2.5 leading-relaxed">
                El gráfico ilustra la reducción convergente del MSE a lo largo de 15 generaciones de optimización con Adam.
              </p>
            </div>
          ) : (
            <div className="bg-[#0F172A] border-2 border-white/10 rounded-xl p-5 space-y-4 shadow-inner">
              <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider">Importancia de Características (Feature Importance)</h4>

              <div className="space-y-3.5">
                {metrics.randomForest.features.map((f, i) => {
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold font-display uppercase tracking-tight text-gray-300">{f.name}</span>
                        <span className="font-mono text-[#FBBF24] font-black">{f.importance}%</span>
                      </div>
                      <div className="w-full bg-[#1E293B] h-2.5 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-[#FBBF24] h-full rounded-full shadow" style={{ width: `${f.importance}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-[#94A3B8] leading-relaxed mt-2.5">
                Calculado por Scikit-Learn basado en la ganancia Gini de los árboles de decisión en datos históricos 2023-2026.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
