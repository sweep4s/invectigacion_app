import React, { useState, useEffect } from "react";
import { Card, CardAdjustment, SimulatePatchResponse } from "../types";
import {
  Beaker,
  Settings,
  RotateCcw,
  Play,
  CheckCircle,
  HelpCircle,
  FileDiff,
  Swords,
  RefreshCw,
  Trash2,
  Sparkles,
  Info,
  Plus,
  X
} from "lucide-react";

interface Props {
  cards: Card[];
}

export default function PatchSimulator({ cards }: Props) {
  // Navigation tabs
  const [simulatorMode, setSimulatorMode] = useState<"matchup" | "balance">("matchup");

  // --- STATE FOR MATCHUP SIMULATOR ---
  const [deckA, setDeckA] = useState<Card[]>([]);
  const [deckB, setDeckB] = useState<Card[]>([]);

  // --- STATE FOR CARD SELECTOR OVERLAY MODAL ---
  const [activeDeckForSelector, setActiveDeckForSelector] = useState<"A" | "B" | null>(null);
  const [selectorFilterType, setSelectorFilterType] = useState<string>("all");
  const [selectorFilterEvolution, setFilterEvolutionSelector] = useState<boolean | null>(null);
  const [selectorSearchQuery, setSelectorSearchQuery] = useState<string>("");
  const [matchupLoading, setMatchupLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Iniciando simulador neural...");
  const [matchupResult, setMatchupResult] = useState<{
    winner: "A" | "B";
    probA: number;
    probB: number;
    verdict: string;
    metrics: any;
  } | null>(null);
  const [matchupError, setMatchupError] = useState<string | null>(null);
  const [showMatchupResults, setShowMatchupResults] = useState<boolean>(false);

  // Initialize decks with standard archetypes from cards list
  useEffect(() => {
    if (cards && cards.length > 0 && deckA.length === 0 && deckB.length === 0) {
      const getCard = (id: string) => cards.find(c => c.id === id);

      // Deck A (Classic Log Bait inspired)
      const defaultAIds = ["knight", "skeletons", "tesla", "goblin_barrel", "the_log", "princess", "goblin_gang", "valkyrie"];
      // Deck B (Pekka Control/Giant Beatdown hybrid)
      const defaultBIds = ["pekka", "electro_wizard", "poison", "baby_dragon", "giant", "little_prince", "fireball", "goblins"];

      const defA = defaultAIds.map(getCard).filter(Boolean) as Card[];
      const defB = defaultBIds.map(getCard).filter(Boolean) as Card[];

      setDeckA(defA.length === 8 ? defA : cards.slice(0, 8));
      setDeckB(defB.length === 8 ? defB : cards.slice(Math.min(8, cards.length - 8), Math.min(16, cards.length)));
    }
  }, [cards]);

  // Fill Deck with random cards
  const fillRandomDeck = (setDeck: React.Dispatch<React.SetStateAction<Card[]>>) => {
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    setDeck(shuffled.slice(0, 8));
    setMatchupResult(null);
    setShowMatchupResults(false);
    setMatchupError(null);
  };

  // Clear Deck
  const clearDeck = (setDeck: React.Dispatch<React.SetStateAction<Card[]>>) => {
    setDeck([]);
    setMatchupResult(null);
    setShowMatchupResults(false);
    setMatchupError(null);
  };

  // Remove card from deck
  const removeCard = (deck: Card[], setDeck: React.Dispatch<React.SetStateAction<Card[]>>, cardId: string) => {
    setDeck(deck.filter(c => c.id !== cardId));
    setMatchupResult(null);
    setShowMatchupResults(false);
    setMatchupError(null);
  };

  // Add card to deck
  const addCard = (deck: Card[], setDeck: React.Dispatch<React.SetStateAction<Card[]>>, cardId: string) => {
    if (deck.length >= 8) return;
    if (deck.some(c => c.id === cardId)) return;
    const card = cards.find(c => c.id === cardId);
    if (card) {
      setDeck([...deck, card]);
      setMatchupResult(null);
      setShowMatchupResults(false);
      setMatchupError(null);
    }
  };

  // --- STATE FOR ORIGINAL BALANCE SIMULATOR ---
  const [adjustments, setAdjustments] = useState<CardAdjustment[]>([
    { cardId: "knight", type: "nerf", percentage: 15 },
    { cardId: "hog_rider", type: "buff", percentage: 10 }
  ]);
  const [selectedCardId, setSelectedCardId] = useState<string>("knight");
  const [selectedAdjType, setSelectedAdjType] = useState<"buff" | "nerf">("buff");
  const [selectedPercentage, setSelectedPercentage] = useState<number>(10);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);
  const [balanceResult, setBalanceResult] = useState<SimulatePatchResponse | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const handleAddAdjustment = () => {
    const exists = adjustments.some(a => a.cardId === selectedCardId);
    if (exists) {
      setBalanceError("Esta carta ya cuenta con un ajuste de balance en la lista.");
      return;
    }
    setBalanceError(null);
    setAdjustments([...adjustments, { cardId: selectedCardId, type: selectedAdjType, percentage: selectedPercentage }]);
    setBalanceResult(null);
  };

  const handleRemoveAdjustment = (cardId: string) => {
    setAdjustments(adjustments.filter(a => a.cardId !== cardId));
    setBalanceResult(null);
  };

  const handleClearAdjustments = () => {
    setAdjustments([]);
    setBalanceResult(null);
    setBalanceError(null);
  };

  const handleSimulateBalance = async () => {
    if (adjustments.length === 0) {
      setBalanceError("Por favor, agregue al menos un ajuste de balance a la simulación.");
      return;
    }
    setBalanceError(null);
    setBalanceLoading(true);

    try {
      const response = await fetch("/api/clash/simulate-patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardAdjustments: adjustments }),
      });
      const data = await response.json();
      if (response.ok && data.status === "success") {
        setBalanceResult(data);
      } else {
        setBalanceError(data.message || "Error al calcular el impacto del parche.");
      }
    } catch (err) {
      setBalanceError("Fallo de conexión al simular el parche.");
    } finally {
      setBalanceLoading(false);
    }
  };

  // --- MATCHUP SIMULATION LOGIC ---
  const handleSimulateMatchup = () => {
    if (deckA.length !== 8 || deckB.length !== 8) {
      setMatchupError("Ambos mazos deben tener exactamente 8 cartas para iniciar el enfrentamiento.");
      return;
    }
    setMatchupError(null);
    setMatchupLoading(true);
    setShowMatchupResults(false);

    // Messages sequence every 400ms
    const messages = [
      "Analizando sinergias de arquetipos...",
      "Calculando interacciones de elixir...",
      "Evaluando counters lógicos cara a cara...",
      "Analizando tasas de uso en competitivo (2026)...",
      "Generando veredicto táctico final..."
    ];

    let step = 0;
    setLoadingMessage(messages[0]);

    const interval = setInterval(() => {
      step++;
      if (step < messages.length) {
        setLoadingMessage(messages[step]);
      }
    }, 400);

    setTimeout(() => {
      clearInterval(interval);

      // Calculate scores
      const metrics = evaluateMatchupScore(deckA, deckB);

      // Controlled randomness
      const randomFactor = (Math.random() - 0.5) * 6; // range [-3, +3]
      const diff = metrics.scoreA - metrics.scoreB;

      // Convert difference to baseline probability
      let probA = Math.round(50 + diff * 1.5 + randomFactor);
      probA = Math.max(30, Math.min(70, probA)); // Clamped between 30% and 70%
      const probB = 100 - probA;
      const winner = probA >= probB ? "A" : "B";

      const verdict = generateVerdict(winner, metrics);

      setMatchupResult({
        winner,
        probA,
        probB,
        verdict,
        metrics
      });
      setMatchupLoading(false);
      // Trigger animations
      setTimeout(() => {
        setShowMatchupResults(true);
      }, 100);
    }, 2000);
  };

  const evaluateMatchupScore = (deckA: Card[], deckB: Card[]) => {
    let scoreA = 0;
    let scoreB = 0;

    const elixirA = deckA.reduce((sum, c) => sum + c.elixir, 0) / 8;
    const elixirB = deckB.reduce((sum, c) => sum + c.elixir, 0) / 8;

    // 1. Average Elixir score (Ideal range: 2.8 to 4.2)
    const elixirScore = (elixir: number) => {
      if (elixir >= 2.8 && elixir <= 4.2) return 20;
      if (elixir >= 2.4 && elixir < 2.8) return 15;
      if (elixir > 4.2 && elixir <= 4.6) return 15;
      if (elixir >= 1.8 && elixir < 2.4) return 8;
      if (elixir > 4.6 && elixir <= 5.2) return 8;
      return 3; // too heavy or light
    };
    scoreA += elixirScore(elixirA);
    scoreB += elixirScore(elixirB);

    // 2. Win condition list expansion (Cards designed to target or reliably deal tower damage)
    const winConditions = [
      "mortar", "goblin_giant", "hog_rider", "goblin_barrel", "mega_knight", "miner",
      "giant", "x_bow", "balloon", "golem", "elixir_golem", "ram_rider", "goblin_drill",
      "wall_breakers", "lava_hound", "royal_giant", "royal_hogs", "three_musketeers", "electro_giant"
    ];

    const getWinCondCount = (deck: Card[]) => deck.filter(c =>
      winConditions.includes(c.id) ||
      c.archetypes.some(a => ["Siege", "Beatdown", "Bridge Spam", "RG Beatdown"].includes(a))
    ).length;

    const winCondA = getWinCondCount(deckA);
    const winCondB = getWinCondCount(deckB);

    const winCondScore = (count: number) => {
      if (count === 1 || count === 2) return 25; // Perfect balance: main win condition + secondary runner
      if (count === 0) return -15; // Critical failure: no tower pressure card!
      if (count >= 4) return 5; // Too many win conditions, deck is bricked
      return 15; // 3 is acceptable but cluttered
    };
    scoreA += winCondScore(winCondA);
    scoreB += winCondScore(winCondB);

    // 3. Spells balance (Spells are vital for support, direct damage, and swarm mitigation)
    const getSpellCount = (deck: Card[]) => deck.filter(c => c.type === "hechizo").length;
    const spellsA = getSpellCount(deckA);
    const spellsB = getSpellCount(deckB);
    const spellScore = (count: number) => {
      if (count === 2) return 20; // Optimal (1 heavy spell + 1 small spell)
      if (count === 1 || count === 3) return 12;
      if (count === 0) return -10; // Critical failure: no spells to finish towers/support push
      return 4; // 4+ spells is way too heavy
    };
    scoreA += spellScore(spellsA);
    scoreB += spellScore(spellsB);

    // 4. Structure balance (Crucial for building pulls and lane control)
    const getStructCount = (deck: Card[]) => deck.filter(c => c.type === "estructura").length;
    const structsA = getStructCount(deckA);
    const structsB = getStructCount(deckB);
    const structScore = (count: number) => {
      if (count === 1) return 12; // Optimal building pull option
      if (count === 2) return 6;
      return 0; // 0 is okay for bridgespam, but worse for control
    };
    scoreA += structScore(structsA);
    scoreB += structScore(structsB);

    // 5. Archetype synergy calculation
    const getSynergyScore = (deck: Card[]) => {
      const archCounts: Record<string, number> = {};
      deck.forEach(c => {
        c.archetypes.forEach(arch => {
          archCounts[arch] = (archCounts[arch] || 0) + 1;
        });
      });
      let maxShared = 0;
      Object.values(archCounts).forEach(v => {
        if (v > maxShared) maxShared = v;
      });
      return maxShared * 4.5; // up to 36 points
    };
    scoreA += getSynergyScore(deckA);
    scoreB += getSynergyScore(deckB);

    // 6. Historical 2026 WinRates from database
    const getAvgWinRate = (deck: Card[]) => deck.reduce((sum, c) => sum + c.stats2026.winRate, 0) / 8;
    scoreA += getAvgWinRate(deckA) * 0.9;
    scoreB += getAvgWinRate(deckB) * 0.9;

    // 7. Evolution count (Evolution card is a power spike)
    const getEvoCount = (deck: Card[]) => deck.filter(c => c.hasEvolution).length;
    scoreA += getEvoCount(deckA) * 2.5;
    scoreB += getEvoCount(deckB) * 2.5;

    // Helper checking card presence
    const has = (deck: Card[], id: string) => deck.some(c => c.id === id);

    // 8. Specific Combo Synergies
    const checkComboSynergy = (deck: Card[]) => {
      let comboBonus = 0;
      const combos: string[] = [];

      // Combo: Lavaloon
      if (has(deck, "lava_hound") && has(deck, "balloon")) {
        comboBonus += 15;
        combos.push("Lavaloon (Sabueso + Globo)");
      }
      // Combo: Bridge Spam (Pekka/Ram/Bandit)
      if (has(deck, "pekka") && (has(deck, "battle_ram") || has(deck, "bandit") || has(deck, "royal_ghost"))) {
        comboBonus += 12;
        combos.push("Pekka Bridge Spam");
      }
      // Combo: Log Bait (Princess/Gang/Barrel/Skarmy)
      if (has(deck, "goblin_barrel") && (has(deck, "princess") || has(deck, "goblin_gang") || has(deck, "skeleton_army"))) {
        comboBonus += 12;
        combos.push("Log Bait");
      }
      // Combo: EGolem + Healer
      if (has(deck, "elixir_golem") && has(deck, "battle_healer")) {
        comboBonus += 15;
        combos.push("Elixir Golem + Curandera");
      }
      // Combo: Hog EQ
      if (has(deck, "hog_rider") && has(deck, "earthquake")) {
        comboBonus += 10;
        combos.push("Hog + Terremoto");
      }
      // Combo: Exenado (Executioner + Tornado)
      if (has(deck, "executioner") && has(deck, "tornado")) {
        comboBonus += 12;
        combos.push("Exenado (Verdugo + Tornado)");
      }
      // Combo: Giant Graveyard / Splashyard (Graveyard + Poison/Baby Dragon/Tornado/Ice Wizard)
      if (has(deck, "graveyard") && (has(deck, "poison") || has(deck, "baby_dragon") || has(deck, "ice_wizard"))) {
        comboBonus += 10;
        combos.push("Graveyard Control / Splashyard");
      }
      // Combo: Giant Sparky
      if (has(deck, "giant") && has(deck, "sparky")) {
        comboBonus += 10;
        combos.push("Gigante + Chispitas");
      }

      return { comboBonus, combos };
    };

    const comboA = checkComboSynergy(deckA);
    const comboB = checkComboSynergy(deckB);
    scoreA += comboA.comboBonus;
    scoreB += comboB.comboBonus;

    // 9. Cara a cara counters and deck matchup rules
    const countersMatched: string[] = [];

    // Add registered combos to visual feedback log
    comboA.combos.forEach(c => countersMatched.push(`Mazo A activa combo sinérgico: ${c}.`));
    comboB.combos.forEach(c => countersMatched.push(`Mazo B activa combo sinérgico: ${c}.`));

    // Stun list to counter charging units or sparky
    const stunIDs = ["zap", "electro_wizard", "zappies", "electro_spirit", "lightning"];
    const hasStun = (deck: Card[]) => deck.some(c => stunIDs.includes(c.id));

    // Target air helper
    const getAirDefendersCount = (deck: Card[]) => deck.filter(c =>
      c.type === "estructura" || // structures pull/shoot
      (["hechizo", "tropa"].includes(c.type) && (
        c.id === "archers" || c.id === "magic_archer" || c.id === "musketeer" ||
        c.id === "electro_wizard" || c.id === "ice_wizard" || c.id === "wizard" ||
        c.id === "mother_witch" || c.id === "witch" || c.id === "hunter" ||
        c.id === "dart_goblin" || c.id === "spear_goblins" || c.id === "zappies" ||
        c.id === "firecracker" || c.id === "archer_queen" || c.id === "minions" ||
        c.id === "minion_horde" || c.id === "bats" || c.id === "baby_dragon" ||
        c.id === "flying_machine" || c.id === "skeleton_dragons" || c.id === "electro_dragon" ||
        c.id === "inferno_dragon" || ["arrows", "fireball", "poison", "rocket", "lightning"].includes(c.id)
      ))
    ).length;

    // Spell vs swarms helpers
    const groundSwarms = ["skeleton_army", "goblin_gang", "barbarians", "elite_barbarians", "goblins", "spear_goblins"];
    const smallSpells = ["the_log", "zap", "giant_snowball", "arrows", "barbarian_barrel", "royal_delivery"];

    // Rule: Air Defense Weakness
    const hasAirThreatA = deckA.some(c => ["balloon", "lava_hound", "minion_horde"].includes(c.id));
    const airDefB = getAirDefendersCount(deckB);
    if (hasAirThreatA && airDefB <= 2) {
      scoreA += 15;
      countersMatched.push("Mazo A ataca con amenazas aéreas pesadas y Mazo B carece de suficientes defensas antiaéreas.");
    }
    const hasAirThreatB = deckB.some(c => ["balloon", "lava_hound", "minion_horde"].includes(c.id));
    const airDefA = getAirDefendersCount(deckA);
    if (hasAirThreatB && airDefA <= 2) {
      scoreB += 15;
      countersMatched.push("Mazo B ataca con amenazas aéreas pesadas y Mazo A carece de suficientes defensas antiaéreas.");
    }

    // Rule: Small spells vs swarms
    const hasHeavySwarmsA = deckA.some(c => groundSwarms.includes(c.id) || c.id === "bats" || c.id === "minion_horde");
    const hasSmallSpellB = deckB.some(c => smallSpells.includes(c.id));
    if (hasHeavySwarmsA && !hasSmallSpellB) {
      scoreA += 12;
      countersMatched.push("Las hordas y ejércitos de Mazo A abrumarán a Mazo B por falta de hechizos pequeños.");
    }
    const hasHeavySwarmsB = deckB.some(c => groundSwarms.includes(c.id) || c.id === "bats" || c.id === "minion_horde");
    const hasSmallSpellA = deckA.some(c => smallSpells.includes(c.id));
    if (hasHeavySwarmsB && !hasSmallSpellA) {
      scoreB += 12;
      countersMatched.push("Las hordas y ejércitos de Mazo B abrumarán a Mazo A por falta de hechizos pequeños.");
    }

    // Rule: Log vs Goblin Barrel
    if (has(deckB, "goblin_barrel") && has(deckA, "the_log")) {
      scoreA += 8;
      countersMatched.push("El Tronco de Mazo A contrarresta limpiamente al Barril de Duendes de Mazo B.");
    }
    if (has(deckA, "goblin_barrel") && has(deckB, "the_log")) {
      scoreB += 8;
      countersMatched.push("El Tronco de Mazo B contrarresta limpiamente al Barril de Duendes de Mazo A.");
    }

    // Rule: Pekka vs terrestrial tanks
    const heavyTanks = ["mega_knight", "giant", "goblin_giant", "golem", "elixir_golem", "giant_skeleton", "royal_giant", "electro_giant"];
    if (has(deckA, "pekka") && deckB.some(c => heavyTanks.includes(c.id))) {
      scoreA += 12;
      countersMatched.push("El P.E.K.K.A de Mazo A tritura a los tanques pesados de Mazo B.");
    }
    if (has(deckB, "pekka") && deckA.some(c => heavyTanks.includes(c.id))) {
      scoreB += 12;
      countersMatched.push("El P.E.K.K.A de Mazo B tritura a los tanques pesados de Mazo A.");
    }

    // Rule: Inferno Tower / Inferno Dragon vs High HP tanks
    if ((has(deckA, "inferno_tower") || has(deckA, "inferno_dragon")) && deckB.some(c => heavyTanks.includes(c.id))) {
      if (hasStun(deckB)) {
        scoreA += 4; // stun resets inferno, less effective
        countersMatched.push("Mazo A bloquea los tanques de Mazo B con daño infernal, aunque Mazo B posee stuns para resetearlo.");
      } else {
        scoreA += 12;
        countersMatched.push("Mazo A frena en seco a los tanques de Mazo B con daño infernal sin counter de reset.");
      }
    }
    if ((has(deckB, "inferno_tower") || has(deckB, "inferno_dragon")) && deckA.some(c => heavyTanks.includes(c.id))) {
      if (hasStun(deckA)) {
        scoreB += 4;
        countersMatched.push("Mazo B bloquea los tanques de Mazo A con daño infernal, aunque Mazo A posee stuns para resetearlo.");
      } else {
        scoreB += 12;
        countersMatched.push("Mazo B frena en seco a los tanques de Mazo A con daño infernal sin counter de reset.");
      }
    }

    // Rule: Tesla/Buildings vs Hog Rider/Giant/Balloon
    const directTargeters = ["hog_rider", "giant", "balloon", "royal_giant", "ram_rider", "golem"];
    if (structsA > 0 && deckB.some(c => directTargeters.includes(c.id))) {
      scoreA += 8;
      countersMatched.push("Las estructuras de Mazo A interceptan y desvían a los atacantes directos de Mazo B.");
    }
    if (structsB > 0 && deckA.some(c => directTargeters.includes(c.id))) {
      scoreB += 8;
      countersMatched.push("Las estructuras de Mazo B interceptan y desvían a los atacantes directos de Mazo A.");
    }

    // Rule: Earthquake vs Buildings
    if (has(deckA, "earthquake") && structsB > 0) {
      scoreA += 10;
      countersMatched.push("El Terremoto de Mazo A destruirá fácilmente las estructuras defensivas de Mazo B.");
    }
    if (has(deckB, "earthquake") && structsA > 0) {
      scoreB += 10;
      countersMatched.push("El Terremoto de Mazo B destruirá fácilmente las estructuras defensivas de Mazo A.");
    }

    // Rule: Mother Witch vs Swarms
    if (has(deckA, "mother_witch") && deckB.some(c => groundSwarms.includes(c.id) || c.id === "bats" || c.id === "skeleton_barrel")) {
      scoreA += 12;
      countersMatched.push("La Bruja Madre de Mazo A convertirá los swarms de Mazo B en cerdos malditos ofensivos.");
    }
    if (has(deckB, "mother_witch") && deckA.some(c => groundSwarms.includes(c.id) || c.id === "bats" || c.id === "skeleton_barrel")) {
      scoreB += 12;
      countersMatched.push("La Bruja Madre de Mazo B convertirá los swarms de Mazo A en cerdos malditos ofensivos.");
    }

    // Rule: Splash defenders vs ground swarms
    const splashDefenders = ["valkyrie", "executioner", "bowler", "baby_dragon", "wizard"];
    if (deckA.some(c => splashDefenders.includes(c.id)) && deckB.some(c => groundSwarms.includes(c.id))) {
      scoreA += 7;
      countersMatched.push("Mazo A posee daño de área terrestre sólido para disolver las tropas múltiples de Mazo B.");
    }
    if (deckB.some(c => splashDefenders.includes(c.id)) && deckA.some(c => groundSwarms.includes(c.id))) {
      scoreB += 7;
      countersMatched.push("Mazo B posee daño de área terrestre sólido para disolver las tropas múltiples de Mazo A.");
    }

    // Rule: Deflectable cards counters (Monk)
    const deflectable = ["sparky", "rocket", "bowler", "magic_archer"];
    if (has(deckA, "monk") && deckB.some(c => deflectable.includes(c.id))) {
      scoreA += 8;
      countersMatched.push("El Monje de Mazo A puede reflejar ataques pesados o proyectiles de Mazo B.");
    }
    if (has(deckB, "monk") && deckA.some(c => deflectable.includes(c.id))) {
      scoreB += 8;
      countersMatched.push("El Monje de Mazo B puede reflejar ataques pesados o proyectiles de Mazo A.");
    }

    // Rule: Stun counters Sparky
    if (has(deckA, "sparky")) {
      if (hasStun(deckB)) {
        scoreB += 10;
        countersMatched.push("Mazo B posee múltiples cartas eléctricas para resetear indefinidamente a Chispitas de Mazo A.");
      } else {
        scoreA += 10;
        countersMatched.push("Mazo B no tiene formas de resetear a Chispitas de Mazo A, lo que la vuelve extremadamente peligrosa.");
      }
    }
    if (has(deckB, "sparky")) {
      if (hasStun(deckA)) {
        scoreA += 10;
        countersMatched.push("Mazo A posee múltiples cartas eléctricas para resetear indefinidamente a Chispitas de Mazo B.");
      } else {
        scoreB += 10;
        countersMatched.push("Mazo A no tiene formas de resetear a Chispitas de Mazo B, lo que la vuelve extremadamente peligrosa.");
      }
    }

    // Rule: Arrows counter Firecracker / Minion Horde
    if (has(deckA, "arrows") && (has(deckB, "firecracker") || has(deckB, "minion_horde") || has(deckB, "guards"))) {
      scoreA += 7;
      countersMatched.push("Las Flechas de Mazo A limpian instantáneamente unidades frágiles clave de Mazo B (como Lanzapetardos o Horda).");
    }
    if (has(deckB, "arrows") && (has(deckA, "firecracker") || has(deckA, "minion_horde") || has(deckA, "guards"))) {
      scoreB += 7;
      countersMatched.push("Las Flechas de Mazo B limpian instantáneamente unidades frágiles clave de Mazo A (como Lanzapetardos o Horda).");
    }

    return {
      scoreA,
      scoreB,
      elixirA,
      elixirB,
      winCondA,
      winCondB,
      spellsA,
      spellsB,
      structsA,
      structsB,
      countersMatched,
    };
  };

  const generateVerdict = (winner: "A" | "B", metrics: any) => {
    const winnerName = winner === "A" ? "Mazo A (Azul)" : "Mazo B (Rojo)";
    const loserName = winner === "A" ? "Mazo B (Rojo)" : "Mazo A (Azul)";

    const winElixir = winner === "A" ? metrics.elixirA : metrics.elixirB;
    const loseElixir = winner === "A" ? metrics.elixirB : metrics.elixirA;
    const winCondWin = winner === "A" ? metrics.winCondA : metrics.winCondB;
    const winCondLose = winner === "A" ? metrics.winCondB : metrics.winCondA;

    let text = `### Veredicto del Combate Asistido por IA\n\n`;
    text += `El **${winnerName}** se lleva la victoria estadística en este enfrentamiento. `;

    if (winCondWin === 0) {
      text += `Aunque carece de una condición de victoria de torre convencional, la presión constante y el desgaste neutralizaron al rival. `;
    } else if (winCondLose === 0) {
      text += `El oponente (${loserName}) sufrió la carencia de una condición de victoria directa para dañar torres, facilitando la defensa de ${winnerName}. `;
    } else {
      text += `El ${winnerName} logró consolidar sinergias ofensivas capaces de derribar la defensa enemiga. `;
    }

    if (Math.abs(winElixir - loseElixir) > 0.8) {
      if (winElixir < loseElixir) {
        text += `La rotación rápida de elixir (${winElixir.toFixed(1)} vs ${loseElixir.toFixed(1)} promedio) permitió al ganador ciclar defensas y contragolpes letales. `;
      } else {
        text += `A pesar de tener un costo medio de elixir más pesado (${winElixir.toFixed(1)} promedio), las oleadas masivas resultaron imparables para el ciclo rápido del rival. `;
      }
    } else {
      text += `En un duelo de velocidades similares, el posicionamiento estratégico inclinó la balanza. `;
    }

    if (metrics.countersMatched.length > 0) {
      text += `\n\n### Interacciones y Contras Clave:\n`;
      metrics.countersMatched.forEach((counter: string) => {
        text += `- **Efecto Directo**: ${counter}\n`;
      });
    } else {
      text += `\n\n### Interacciones y Contras Clave:\n`;
      text += `- **Cobertura**: Ambos mazos defendieron adecuadamente sus carriles, pero la distribución de daño de área favoreció al ganador.\n`;
      text += `- **Presión**: Se impusieron los contraataques basados en tropas remanentes de defensa.\n`;
    }

    return text;
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.trim().startsWith("###")) {
        return <h3 key={idx} className="text-sm font-black text-[#FBBF24] mt-4 mb-2 font-display uppercase tracking-tight">{line.replace("###", "").trim()}</h3>;
      }
      if (line.trim().startsWith("##")) {
        return <h2 key={idx} className="text-base font-bold text-amber-500 mt-5 mb-2 font-display uppercase tracking-tight">{line.replace("##", "").trim()}</h2>;
      }
      if (line.trim().startsWith("#")) {
        return <h1 key={idx} className="text-lg font-extrabold text-[#FBBF24] mt-6 mb-3 font-display uppercase tracking-tight">{line.replace("#", "").trim()}</h1>;
      }
      if (line.trim().startsWith("*") || line.trim().startsWith("-")) {
        return (
          <li key={idx} className="text-xs text-blue-100 ml-4 list-disc mb-1 font-sans">
            {line.replace(/^[\s*-]+/, "").trim()}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs text-blue-100 leading-relaxed mb-1 font-sans">{line}</p>;
    });
  };

  return (
    <div className="space-y-6" id="container-patch-simulator">

      {/* Switch Mode Tabs */}
      <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 max-w-lg mx-auto shadow-inner">
        <button
          onClick={() => setSimulatorMode("matchup")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-display font-black uppercase rounded-xl transition-all duration-300 cursor-pointer ${simulatorMode === "matchup"
              ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/20 border-b-2 border-blue-600"
              : "text-gray-400 hover:text-white"
            }`}
        >
          <Swords className="w-4 h-4" />
          Simulador de Enfrentamientos
        </button>
        <button
          onClick={() => setSimulatorMode("balance")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-display font-black uppercase rounded-xl transition-all duration-300 cursor-pointer ${simulatorMode === "balance"
              ? "bg-[#FBBF24] text-black shadow-lg shadow-amber-500/20 border-b-2 border-amber-600"
              : "text-gray-400 hover:text-white"
            }`}
        >
          <Beaker className="w-4 h-4" />
          Laboratorio de Parches
        </button>
      </div>

      {/* --- MODE: MATCHUP SIMULATOR --- */}
      {simulatorMode === "matchup" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Deck configuration columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* COLUMN MAZO A (AZUL) */}
            <div className="lg:col-span-5 bg-[#1E293B] border-2 border-blue-500/20 rounded-3xl p-5 shadow-2xl relative flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-3 bg-blue-500/10 text-blue-400 rounded-bl-2xl font-mono text-[9px] font-bold uppercase tracking-wider">
                Mazo A: Azul
              </div>

              <div>
                <h3 className="text-base font-black text-blue-400 flex items-center gap-2 uppercase tracking-tight italic">
                  DECK AZUL
                </h3>
                <p className="text-[10px] text-blue-200 mt-1 mb-4 leading-relaxed font-sans">
                  Configura el primer mazo para la simulación táctica. Elimina o añade cartas de la base de datos meta.
                </p>

                {/* Deck Cards Grid */}
                <div className="grid grid-cols-4 gap-2.5 min-h-[220px] bg-black/20 p-3 rounded-2xl border border-white/5">
                  {Array.from({ length: 8 }).map((_, idx) => {
                    const card = deckA[idx];
                    if (card) {
                      return (
                        <div
                          key={card.id}
                          className="aspect-[3/4] bg-gradient-to-b from-blue-900 to-blue-950 rounded-xl border border-blue-400/40 p-1 relative group overflow-hidden shadow-lg flex flex-col items-center justify-between"
                        >
                          <div className="absolute top-0.5 left-0.5 bg-blue-600 w-4 h-4 rounded-full border border-white flex items-center justify-center font-mono font-black text-[9px] text-white">
                            {card.elixir}
                          </div>

                          {card.hasEvolution && (
                            <span className="absolute top-0.5 right-0.5 bg-purple-600 text-white text-[7px] font-bold px-0.5 rounded font-mono border border-white/20">
                              EVO
                            </span>
                          )}

                          <img
                            src={card.imgUrl}
                            alt={card.name}
                            className="w-10 h-12 object-contain mt-2 drop-shadow-lg"
                            referrerPolicy="no-referrer"
                          />

                          <p className="text-[8px] font-black uppercase text-white truncate w-full text-center px-0.5 mb-1 select-none">
                            {card.name}
                          </p>

                          {/* Delete Hover Action */}
                          <button
                            onClick={() => removeCard(deckA, setDeckA, card.id)}
                            className="absolute inset-0 bg-red-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                            title="Eliminar carta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    } else {
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveDeckForSelector("A")}
                          className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 font-bold hover:border-blue-500/40 hover:text-blue-400 hover:bg-blue-950/20 transition-all cursor-pointer"
                        >
                          <span className="text-base font-light">+</span>
                        </button>
                      );
                    }
                  })}
                </div>
              </div>

              {/* Controls and Stats */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-xs font-mono mb-4 text-blue-200">
                  <span>Costo Promedio:</span>
                  <span className="font-black text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/30">
                    {(deckA.reduce((sum, c) => sum + c.elixir, 0) / (deckA.length || 1)).toFixed(1)} 💧
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveDeckForSelector("A")}
                    disabled={deckA.length >= 8}
                    className="col-span-2 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-[#0F172A]/50 disabled:text-gray-600 disabled:border-white/5 text-white text-[10px] font-bold uppercase rounded-xl border border-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir Carta
                  </button>

                  <button
                    onClick={() => clearDeck(setDeckA)}
                    className="py-2 border border-red-500/20 hover:bg-red-950/20 text-red-400 text-[9px] font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    Limpiar
                  </button>
                </div>

                <button
                  onClick={() => fillRandomDeck(setDeckA)}
                  className="w-full mt-2 py-2 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-700/40 text-blue-300 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Cargar Mazo Aleatorio
                </button>
              </div>
            </div>

            {/* CENTER DECORATION & SIMULATE BUTTON */}
            <div className="lg:col-span-2 flex flex-col justify-center items-center gap-4 py-6 lg:py-0">
              <div className="relative w-16 h-16 rounded-full bg-[#0F172A] border-4 border-white/5 flex items-center justify-center shadow-xl">
                <span className="text-xl font-display font-black italic text-[#FBBF24] tracking-tighter">VS</span>
                <div className="absolute -inset-1 rounded-full border border-blue-500/20 animate-pulse pointer-events-none" />
                <div className="absolute -inset-2 rounded-full border border-red-500/20 animate-pulse pointer-events-none" />
              </div>

              <button
                onClick={handleSimulateMatchup}
                disabled={deckA.length !== 8 || deckB.length !== 8 || matchupLoading}
                className={`w-full py-4 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all duration-300 flex flex-col items-center justify-center gap-1.5 shadow-2xl active:scale-[0.98] cursor-pointer ${deckA.length === 8 && deckB.length === 8 && !matchupLoading
                    ? "bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white shadow-purple-500/10 border-2 border-white/10"
                    : "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                  }`}
              >
                {matchupLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mb-1" />
                    <span className="text-[10px] font-sans text-gray-300">{loadingMessage}</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-5 h-5 text-[#FBBF24] animate-bounce" />
                    <span>Simular Combate AI</span>
                  </>
                )}
              </button>

              {matchupError && (
                <div className="text-center text-[9px] font-mono font-bold text-red-400 bg-red-950/20 p-2 rounded-xl border border-red-500/20 max-w-[180px]">
                  {matchupError}
                </div>
              )}
            </div>

            {/* COLUMN MAZO B (ROJO) */}
            <div className="lg:col-span-5 bg-[#1E293B] border-2 border-red-500/20 rounded-3xl p-5 shadow-2xl relative flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-3 bg-red-500/10 text-red-400 rounded-bl-2xl font-mono text-[9px] font-bold uppercase tracking-wider">
                Mazo B: Rojo
              </div>

              <div>
                <h3 className="text-base font-black text-red-400 flex items-center gap-2 uppercase tracking-tight italic">
                  DECK ROJO
                </h3>
                <p className="text-[10px] text-red-200 mt-1 mb-4 leading-relaxed font-sans">
                  Configura el segundo mazo adversario. Elige cartas balanceadas para responder tácticamente.
                </p>

                {/* Deck Cards Grid */}
                <div className="grid grid-cols-4 gap-2.5 min-h-[220px] bg-black/20 p-3 rounded-2xl border border-white/5">
                  {Array.from({ length: 8 }).map((_, idx) => {
                    const card = deckB[idx];
                    if (card) {
                      return (
                        <div
                          key={card.id}
                          className="aspect-[3/4] bg-gradient-to-b from-red-900 to-red-950 rounded-xl border border-red-400/40 p-1 relative group overflow-hidden shadow-lg flex flex-col items-center justify-between"
                        >
                          <div className="absolute top-0.5 left-0.5 bg-red-600 w-4 h-4 rounded-full border border-white flex items-center justify-center font-mono font-black text-[9px] text-white">
                            {card.elixir}
                          </div>

                          {card.hasEvolution && (
                            <span className="absolute top-0.5 right-0.5 bg-purple-600 text-white text-[7px] font-bold px-0.5 rounded font-mono border border-white/20">
                              EVO
                            </span>
                          )}

                          <img
                            src={card.imgUrl}
                            alt={card.name}
                            className="w-10 h-12 object-contain mt-2 drop-shadow-lg"
                            referrerPolicy="no-referrer"
                          />

                          <p className="text-[8px] font-black uppercase text-white truncate w-full text-center px-0.5 mb-1 select-none">
                            {card.name}
                          </p>

                          {/* Delete Hover Action */}
                          <button
                            onClick={() => removeCard(deckB, setDeckB, card.id)}
                            className="absolute inset-0 bg-red-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                            title="Eliminar carta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    } else {
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveDeckForSelector("B")}
                          className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 font-bold hover:border-red-500/40 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                        >
                          <span className="text-base font-light">+</span>
                        </button>
                      );
                    }
                  })}
                </div>
              </div>

              {/* Controls and Stats */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-xs font-mono mb-4 text-red-200">
                  <span>Costo Promedio:</span>
                  <span className="font-black text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30">
                    {(deckB.reduce((sum, c) => sum + c.elixir, 0) / (deckB.length || 1)).toFixed(1)} 💧
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveDeckForSelector("B")}
                    disabled={deckB.length >= 8}
                    className="col-span-2 py-2 bg-red-600 hover:bg-red-500 disabled:bg-[#0F172A]/50 disabled:text-gray-600 disabled:border-white/5 text-white text-[10px] font-bold uppercase rounded-xl border border-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir Carta
                  </button>

                  <button
                    onClick={() => clearDeck(setDeckB)}
                    className="py-2 border border-red-500/20 hover:bg-red-950/20 text-red-400 text-[9px] font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    Limpiar
                  </button>
                </div>

                <button
                  onClick={() => fillRandomDeck(setDeckB)}
                  className="w-full mt-2 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-700/40 text-red-300 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Cargar Mazo Aleatorio
                </button>
              </div>
            </div>

          </div>

          {/* SIMULATION RESULTS CONTAINER */}
          {matchupResult && (
            <div
              className={`bg-[#1E293B] border-2 rounded-3xl p-6 shadow-2xl transition-all duration-700 ease-out transform ${showMatchupResults ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                } ${matchupResult.winner === "A"
                  ? "border-blue-500/40 shadow-blue-500/5"
                  : "border-red-500/40 shadow-red-500/5"
                }`}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div>
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono px-2.5 py-1 rounded-md font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#FBBF24] animate-pulse" />
                    Simulación Predictiva Finalizada
                  </span>
                  <h3 className="text-lg font-black text-white mt-1.5 uppercase tracking-tight italic flex items-center gap-2">
                    {matchupResult.winner === "A" ? (
                      <>
                        <span className="text-blue-400">🛡️ Mazo A</span> se lleva la victoria estadística!
                      </>
                    ) : (
                      <>
                        <span className="text-red-400">⚔️ Mazo B</span> se lleva la victoria estadística!
                      </>
                    )}
                  </h3>
                </div>

                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm inline-block shadow-md shadow-blue-500/20" /> Mazo A: {matchupResult.probA}%</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-sm inline-block shadow-md shadow-red-500/20" /> Mazo B: {matchupResult.probB}%</span>
                </div>
              </div>

              {/* Percentage Bars Visual Representation */}
              <div className="space-y-2 mb-6">
                <div className="h-6 w-full bg-black/40 rounded-full overflow-hidden flex p-1 border border-white/5 relative">

                  {/* Blue bar */}
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-l-full transition-all duration-1000 ease-out flex items-center justify-start pl-3 text-[10px] font-black text-white"
                    style={{ width: `${matchupResult.probA}%` }}
                  >
                    <span>MAZO A ({matchupResult.probA}%)</span>
                  </div>

                  {/* Red bar */}
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-r-full transition-all duration-1000 ease-out flex items-center justify-end pr-3 text-[10px] font-black text-white"
                    style={{ width: `${matchupResult.probB}%` }}
                  >
                    <span>MAZO B ({matchupResult.probB}%)</span>
                  </div>

                  {/* Vertical Divider */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#FBBF24]/30 pointer-events-none" />
                </div>
              </div>

              {/* Winning Deck highlighted grid */}
              <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 mb-6">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  Mazo Ganador Destacado:
                </h4>

                <div className="flex flex-wrap gap-2.5 justify-center">
                  {(matchupResult.winner === "A" ? deckA : deckB).map(card => (
                    <div
                      key={card.id}
                      className={`w-14 bg-black/30 rounded-lg p-1.5 border border-white/10 flex flex-col items-center relative ${matchupResult.winner === "A"
                          ? "border-blue-500/30 shadow-md shadow-blue-500/5"
                          : "border-red-500/30 shadow-md shadow-red-500/5"
                        }`}
                    >
                      <span className="absolute top-0.5 left-0.5 bg-black/60 px-1 rounded font-mono text-[8px] text-gray-300">
                        {card.elixir}
                      </span>
                      <img src={card.imgUrl} alt={card.name} className="w-8 h-10 object-contain mt-1" referrerPolicy="no-referrer" />
                      <p className="text-[7px] text-center truncate w-full text-white/80 font-mono mt-1 font-semibold">{card.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI mini verdict text */}
              <div className="bg-[#0F172A]/70 border border-white/5 rounded-2xl p-5 relative overflow-hidden shadow-inner font-mono">
                <div className="absolute top-0 right-0 p-3 bg-purple-500/10 text-[#FBBF24] rounded-bl-2xl border-l border-b border-white/5 flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider">
                  <Info className="w-3 h-3 text-[#FBBF24]" />
                  <span>Deducción del Sistema</span>
                </div>

                <div className="max-w-none text-xs space-y-3 mt-2 pr-4 leading-relaxed text-blue-100">
                  {renderMarkdown(matchupResult.verdict)}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* --- MODE: ORIGINAL BALANCE SIMULATOR --- */}
      {simulatorMode === "balance" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
          {/* Left column - Balance configuration inputs */}
          <div className="lg:col-span-5 bg-[#1E293B] border-2 border-white/5 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-base font-black text-[#FBBF24] flex items-center gap-2 uppercase tracking-tight italic">
                <Beaker className="w-5 h-5 text-[#FBBF24] animate-pulse" />
                Laboratorio de Simulación
              </h2>
              <p className="text-[10px] text-blue-100 mt-1 mb-5 leading-relaxed font-sans">
                Formula hipótesis de causa-efecto ajustando atributos de juego y examina cómo reacciona el ecosistema global.
              </p>

              {/* Config Area */}
              <div className="space-y-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                <h3 className="text-xs font-black text-gray-300 flex items-center gap-1.5 mb-2 uppercase tracking-tight">
                  <Settings className="w-4 h-4 text-[#FBBF24]" />
                  Configurar Ajuste
                </h3>

                {/* Card Dropdown */}
                <div>
                  <label className="text-[9px] text-gray-300 block font-mono font-bold uppercase mb-1">Seleccionar Carta</label>
                  <select
                    id="select-adj-card"
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="w-full bg-[#0F172A] text-gray-200 border-2 border-white/10 rounded-xl p-2 text-xs focus:outline-none focus:border-[#FBBF24] cursor-pointer"
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
                    <label className="text-[9px] text-gray-300 block font-mono font-bold uppercase mb-1">Sentido</label>
                    <div className="flex bg-[#0F172A] p-1 rounded-xl border-2 border-white/10">
                      <button
                        id="btn-toggle-buff"
                        onClick={() => setSelectedAdjType("buff")}
                        className={`flex-1 text-center py-1 text-xs rounded-lg transition-all font-black cursor-pointer ${selectedAdjType === "buff" ? "bg-[#10B981] text-black shadow-lg" : "text-gray-400 hover:text-white"
                          }`}
                      >
                        BUFF
                      </button>
                      <button
                        id="btn-toggle-nerf"
                        onClick={() => setSelectedAdjType("nerf")}
                        className={`flex-1 text-center py-1 text-xs rounded-lg transition-all font-black cursor-pointer ${selectedAdjType === "nerf" ? "bg-[#EF4444] text-white shadow-lg" : "text-gray-400 hover:text-white"
                          }`}
                      >
                        NERF
                      </button>
                    </div>
                  </div>

                  {/* Percentage Weight */}
                  <div>
                    <label className="text-[9px] text-gray-300 block font-mono font-bold uppercase mb-1">Magnitud (%)</label>
                    <select
                      id="select-adj-percentage"
                      value={selectedPercentage}
                      onChange={(e) => setSelectedPercentage(Number(e.target.value))}
                      className="w-full bg-[#0F172A] text-gray-200 border-2 border-white/10 rounded-xl p-2 text-xs focus:outline-none focus:border-[#FBBF24] cursor-pointer"
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
                  className="w-full py-2.5 bg-[#FBBF24] hover:bg-[#FBBF24]/90 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all duration-200 mt-2 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  Agregar a Simulación
                </button>
              </div>
            </div>

            {/* Current Settings List */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-300 font-mono">Ajustes a Simular:</span>
                {adjustments.length > 0 && (
                  <button
                    id="btn-clear-all-adj"
                    onClick={handleClearAdjustments}
                    className="text-[9px] text-red-400 hover:text-red-300 font-mono font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Limpiar lista
                  </button>
                )}
              </div>

              {adjustments.length === 0 ? (
                <div className="py-6 bg-black/20 rounded-2xl border-2 border-dashed border-white/5 text-center text-xs text-blue-100 italic">
                  Agrega al menos una hipótesis (Buff/Nerf) de balance.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 select-scrollbar">
                  {adjustments.map(adj => {
                    const card = cards.find(c => c.id === adj.cardId);
                    return (
                      <div
                        key={adj.cardId}
                        className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/5 text-xs font-sans"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${adj.type === "buff" ? "bg-[#10B981] animate-pulse" : "bg-[#EF4444] animate-pulse"
                              }`}
                          />
                          <span className="font-bold text-blue-100">{card?.name || adj.cardId}</span>
                          <span
                            className={`font-mono font-black uppercase text-[8px] px-1.5 py-0.5 rounded-md ${adj.type === "buff" ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20" : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                              }`}
                          >
                            {adj.type} {adj.percentage}%
                          </span>
                        </div>

                        <button
                          id={`btn-remove-adj-${adj.cardId}`}
                          onClick={() => handleRemoveAdjustment(adj.cardId)}
                          className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider px-1 cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {balanceError && (
                <div className="mt-3 text-center text-xs font-mono font-bold text-red-400 bg-red-950/20 p-2.5 rounded-xl border border-red-500/20 shadow-inner">
                  {balanceError}
                </div>
              )}

              {/* Run Button */}
              <button
                id="btn-run-simulation"
                onClick={handleSimulateBalance}
                disabled={adjustments.length === 0 || balanceLoading}
                className={`w-full mt-4 py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] cursor-pointer ${adjustments.length > 0 && !balanceLoading
                    ? "bg-[#EF4444] hover:bg-[#EF4444]/90 text-white shadow-red-600/15"
                    : "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                  }`}
              >
                {balanceLoading ? (
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

          {/* Right column: Explanatory Background / Balance Results */}
          <div className="lg:col-span-7 bg-[#1E293B] border-2 border-white/5 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
            {!balanceResult ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-base font-black text-[#FBBF24] pb-2.5 border-b border-white/5 mb-3.5 uppercase tracking-tight italic">
                    ¿Cómo funciona el Simulador de Balances?
                  </h3>

                  <div className="prose prose-invert text-xs space-y-4 text-gray-300 leading-relaxed">
                    <p className="text-blue-100 font-sans leading-relaxed">
                      El metajuego de Clash Royale es altamente dinámico y reactivo:
                      un ajuste sobre una carta específica provoca una alteración colateral y en cascada sobre otras cartas y arquetipos.
                    </p>

                    <div className="bg-[#0F172A] p-4 border border-white/5 rounded-2xl space-y-3 shadow-inner">
                      <h4 className="text-[#FBBF24] font-black text-xs flex items-center gap-1.5 uppercase tracking-wide font-mono">
                        <CheckCircle className="w-4 h-4 text-[#FBBF24]" />
                        Ciclo Operativo del Simulador Neural:
                      </h4>
                      <ul className="space-y-2.5 list-none pl-1 text-[11px]">
                        <li className="flex items-start gap-2.5">
                          <span className="text-[#FBBF24] font-black font-mono">01.</span>
                          <span className="text-blue-100"><strong>Perturbación Directa:</strong> Modifica el win-rate de las cartas alteradas en base a la magnitud de los buffs/nerfs aplicados.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="text-[#FBBF24] font-black font-mono">02.</span>
                          <span className="text-blue-100"><strong>Respuesta Sistémica:</strong> El algoritmo recalcula las tasas de uso de cartas asociadas dentro del mismo arquetipo.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="text-[#FBBF24] font-black font-mono">03.</span>
                          <span className="text-blue-100"><strong>Reporte Asistido:</strong> Genera un reporte analítico detallado explicando el nuevo balance de popularidad.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-300 leading-relaxed flex gap-2">
                    <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-red-400 font-bold uppercase block text-[9px] mb-0.5">Nota del Modelo:</strong>
                      La predicción deduce si el juego se orientará a un metajuego defensivo / lento (tipo Control) o hiper-agresivo (tipo Beatdown).
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 select-scrollbar">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-3 gap-2">
                  <div>
                    <span className="bg-red-500/15 text-red-300 border border-red-500/30 text-[9px] font-mono px-2 py-0.5 rounded font-black uppercase tracking-wider">
                      Simulación Parche Completada
                    </span>
                    <h3 className="text-base font-black text-[#FBBF24] mt-1.5 uppercase tracking-tight italic">
                      Impacto del Balance en Metajuego
                    </h3>
                  </div>

                  <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-500 rounded-sm inline-block" /> Base 2026</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-sm inline-block" /> Simulado</span>
                  </div>
                </div>

                {/* Bar Chart comparing baseline vs simulated rates */}
                <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 shadow-inner">
                  <h4 className="text-[9px] font-black text-gray-400 mb-3.5 font-mono uppercase tracking-widest">Tasa de Uso del Metajuego (%)</h4>

                  <div className="space-y-3.5">
                    {balanceResult.simulatedCards.filter(c => {
                      const isAdj = balanceResult.adjustments.some(a => a.cardId === c.id);
                      return isAdj || c.baselineUse > 12;
                    }).map(c => {
                      const maxPct = 40;
                      const baselineW = Math.min((c.baselineUse / maxPct) * 100, 100);
                      const simulatedW = Math.min((c.simulatedUse / maxPct) * 100, 100);

                      const isAdjusted = balanceResult.adjustments.some(a => a.cardId === c.id);
                      const isBuffed = isAdjusted && balanceResult.adjustments.find(a => a.cardId === c.id)?.type === "buff";
                      const isNerfed = isAdjusted && balanceResult.adjustments.find(a => a.cardId === c.id)?.type === "nerf";
                      const cardObject = cards.find(x => x.id === c.id);

                      return (
                        <div key={c.id} className="grid grid-cols-12 items-center gap-2 text-[11px] border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                          {/* Card Label */}
                          <div className="col-span-3 font-black text-blue-100 truncate flex items-center gap-1.5">
                            {isBuffed && <span className="text-[#10B981] font-bold text-[9px]">▲</span>}
                            {isNerfed && <span className="text-[#EF4444] font-bold text-[9px]">▼</span>}
                            {cardObject?.imgUrl && (
                              <img
                                src={cardObject.imgUrl}
                                alt={c.name}
                                className="w-4 h-5 object-contain rounded"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <span>{c.name}</span>
                          </div>

                          {/* Dual visual bars */}
                          <div className="col-span-7 space-y-1 relative py-1 border-l-2 border-white/10 pl-1.5">
                            <div className="h-1.5 bg-gray-600/40 rounded-full relative" style={{ width: `${baselineW}%` }}>
                              <span className="absolute -right-8 -top-1 text-[8px] text-gray-400 font-mono font-bold">
                                {c.baselineUse}%
                              </span>
                            </div>

                            <div className="h-2 bg-[#EF4444] rounded-full relative" style={{ width: `${simulatedW}%` }}>
                              <span className="absolute -right-8 -top-0.5 text-[8px] text-red-300 font-mono font-black">
                                {c.simulatedUse}%
                              </span>
                            </div>
                          </div>

                          {/* Difference Label */}
                          <div className="col-span-2 text-right font-mono text-[9px] font-black">
                            {c.simulatedUse - c.baselineUse === 0 ? (
                              <span className="text-gray-500">0.0%</span>
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

                {/* AI report */}
                <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2.5 bg-red-500/10 text-red-400 rounded-bl-xl border-l border-b border-white/5 flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider">
                    <FileDiff className="w-3.5 h-3.5 text-[#FBBF24]" />
                    <span>Deducción AI del Parche</span>
                  </div>

                  <div className="prose prose-invert max-w-none text-xs space-y-3 text-blue-100 font-sans mt-5">
                    {renderMarkdown(balanceResult.aiDeduction)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CARD SELECTOR MODAL OVERLAY */}
      {activeDeckForSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div
            className={`bg-[#1E293B] border-2 rounded-3xl w-full max-w-4xl p-6 shadow-2xl flex flex-col max-h-[90vh] ${activeDeckForSelector === "A" ? "border-blue-500/40" : "border-red-500/40"
              }`}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-lg font-display font-black text-[#FBBF24] uppercase italic flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FBBF24]" />
                  Añadir carta a {activeDeckForSelector === "A" ? "Mazo A (Azul)" : "Mazo B (Rojo)"}
                </h3>
                <p className="text-xs text-blue-200 font-sans mt-0.5">
                  Selecciona una carta del meta para completar tu alineación ({activeDeckForSelector === "A" ? deckA.length : deckB.length}/8 cartas)
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveDeckForSelector(null);
                  setSelectorSearchQuery("");
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters Bar: Search + Category buttons */}
            <div className="flex flex-col md:flex-row gap-3 mb-4 bg-black/20 p-3 rounded-2xl border border-white/5">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar carta por nombre o arquetipo..."
                  value={selectorSearchQuery}
                  onChange={(e) => setSelectorSearchQuery(e.target.value)}
                  className="w-full bg-[#0F172A] text-gray-200 border border-white/10 rounded-xl pl-3 pr-10 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
                {selectorSearchQuery && (
                  <button
                    onClick={() => setSelectorSearchQuery("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <button
                  onClick={() => setSelectorFilterType("all")}
                  className={`px-3 py-1.5 text-[10px] rounded-lg font-bold uppercase transition-all cursor-pointer ${selectorFilterType === "all" ? "bg-[#FBBF24] text-black shadow-inner" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectorFilterType("tropa")}
                  className={`px-3 py-1.5 text-[10px] rounded-lg font-bold uppercase transition-all cursor-pointer ${selectorFilterType === "tropa" ? "bg-[#FBBF24] text-black shadow-inner" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                >
                  Tropas
                </button>
                <button
                  onClick={() => setSelectorFilterType("hechizo")}
                  className={`px-3 py-1.5 text-[10px] rounded-lg font-bold uppercase transition-all cursor-pointer ${selectorFilterType === "hechizo" ? "bg-[#FBBF24] text-black shadow-inner" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                >
                  Hechizos
                </button>
                <button
                  onClick={() => setSelectorFilterType("estructura")}
                  className={`px-3 py-1.5 text-[10px] rounded-lg font-bold uppercase transition-all cursor-pointer ${selectorFilterType === "estructura" ? "bg-[#FBBF24] text-black shadow-inner" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                >
                  Estructuras
                </button>
                <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />
                <button
                  onClick={() => setFilterEvolutionSelector(selectorFilterEvolution === null ? true : selectorFilterEvolution === true ? false : null)}
                  className={`px-3 py-1.5 text-[10px] rounded-lg border font-bold uppercase transition-all cursor-pointer ${selectorFilterEvolution === true
                      ? "bg-[#9333EA] border-purple-400 text-white"
                      : selectorFilterEvolution === false
                        ? "bg-slate-800 border-slate-600 text-slate-300"
                        : "border-transparent text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {selectorFilterEvolution === true ? "Evoluciones" : selectorFilterEvolution === false ? "Básicas" : "Filtrar Evo"}
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="overflow-y-auto pr-1 flex-1 min-h-[300px]">
              {(() => {
                const currentDeck = activeDeckForSelector === "A" ? deckA : deckB;
                const setDeck = activeDeckForSelector === "A" ? setDeckA : setDeckB;

                const selectorFilteredCards = cards.filter(c => {
                  // Filter out cards already in the deck
                  if (currentDeck.some(x => x.id === c.id)) return false;

                  // Filter by search query
                  if (selectorSearchQuery.trim() !== "") {
                    const q = selectorSearchQuery.toLowerCase();
                    const matchesName = c.name.toLowerCase().includes(q);
                    const matchesType = c.type.toLowerCase().includes(q);
                    const matchesArchetype = c.archetypes.some(a => a.toLowerCase().includes(q));
                    if (!matchesName && !matchesType && !matchesArchetype) return false;
                  }

                  // Filter by type
                  if (selectorFilterType !== "all" && c.type !== selectorFilterType) return false;

                  // Filter by evolution status
                  if (selectorFilterEvolution !== null && c.hasEvolution !== selectorFilterEvolution) return false;

                  return true;
                });

                if (selectorFilteredCards.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 italic">
                      <p>No se encontraron cartas que coincidan con la búsqueda o filtros.</p>
                      <button
                        onClick={() => {
                          setSelectorSearchQuery("");
                          setSelectorFilterType("all");
                          setFilterEvolutionSelector(null);
                        }}
                        className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase text-white cursor-pointer transition-all"
                      >
                        Restablecer filtros
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {selectorFilteredCards.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          addCard(currentDeck, setDeck, c.id);
                          setActiveDeckForSelector(null);
                          setSelectorSearchQuery("");
                        }}
                        className="relative p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-[110px] overflow-hidden group bg-[#0F172A] border-white/5 hover:border-blue-500/50 hover:scale-[1.02] cursor-pointer hover:ring-2 hover:ring-blue-500/25"
                      >
                        {c.imgUrl && (
                          <img
                            src={c.imgUrl}
                            alt={c.name}
                            className="absolute -right-2 -bottom-3 w-[60px] h-[70px] object-contain pointer-events-none opacity-40 group-hover:opacity-75 group-hover:scale-105 transition-all z-0"
                            referrerPolicy="no-referrer"
                          />
                        )}

                        {c.hasEvolution && (
                          <span className="absolute top-2 right-2 bg-purple-600 text-white text-[7px] font-mono font-black px-1 rounded border border-white/20 z-10">
                            EVO
                          </span>
                        )}

                        <div className="relative z-10">
                          <span className="text-gray-400 text-[8px] font-mono leading-none block uppercase font-black">
                            {c.rarity}
                          </span>
                          <h4 className="text-white font-display text-xs font-black leading-tight pr-6 mt-0.5 truncate uppercase">
                            {c.name}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between w-full relative z-10 mt-auto">
                          <span className="text-[9px] font-black text-white bg-purple-900/60 border border-purple-700/50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            {c.elixir}🧪
                          </span>
                          <span className="text-[9px] bg-blue-900/40 text-blue-300 font-black px-1.5 py-0.5 rounded border border-blue-800/30 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            +
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
