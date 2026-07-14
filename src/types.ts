/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Card {
  id: string;
  name: string;
  elixir: number;
  type: "tropa" | "hechizo" | "estructura";
  rarity: "común" | "especial" | "épica" | "legendaria" | "campeón";
  hasEvolution: boolean;
  evolutionYear?: number;
  imgUrl: string;
  archetypes: string[];
  stats2023: { useRate: number; winRate: number };
  stats2024: { useRate: number; winRate: number };
  stats2025: { useRate: number; winRate: number };
  stats2026: { useRate: number; winRate: number };
}

export interface DeckMetrics {
  avgElixir: number;
  cycleCount: number;
  distribution: { tropa: number; spell: number; estructura: number };
  evoCount: number;
  primaryArchetype: string;
  synergyScore: number;
  predictedWinRate: number;
  predictedUseRate: number;
  metaRating: number;
}

export interface PredictDeckResponse {
  status: string;
  metrics: DeckMetrics;
  aiEvaluation: string;
}

export interface CardAdjustment {
  cardId: string;
  type: "buff" | "nerf";
  percentage: number;
}

export interface SimulatedCardResult {
  id: string;
  name: string;
  baselineUse: number;
  baselineWin: number;
  simulatedUse: number;
  simulatedWin: number;
}

export interface SimulatePatchResponse {
  status: string;
  adjustments: CardAdjustment[];
  simulatedCards: SimulatedCardResult[];
  aiDeduction: string;
}

export interface LSTMPerformance {
  epoch: number;
  trainLoss: number;
  valLoss: number;
}

export interface FeatureImportance {
  name: string;
  importance: number;
}

export interface ModelMetricsData {
  lstm: {
    epochs: LSTMPerformance[];
    metrics: {
      mse: number;
      mae: number;
      accuracy: number;
      precision: number;
      recall: number;
    };
    description: string;
  };
  randomForest: {
    features: FeatureImportance[];
    metrics: {
      mse: number;
      mae: number;
      accuracy: number;
      precision: number;
      recall: number;
    };
    description: string;
  };
}

export interface PlayerCard {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  count: number;
}

export interface PlayerProfile {
  name: string;
  tag: string;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  wins: number;
  losses: number;
  threeCrownWins: number;
  warDayWins: number;
  clan?: {
    name: string;
    tag: string;
  };
  currentDeck: PlayerCard[];
  cards: PlayerCard[];
  history: { season: string; trophies: number }[];
  projections: {
    nextSeasons: { season: string; predictedTrophies: number }[];
    goldNeeded: number;
    completionPercent: number;
    recommendedDeck: string[];
  };
}
