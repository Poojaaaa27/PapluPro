
"use client";

import React, { createContext, useState, useMemo, useCallback, ReactNode, useContext } from "react";
import type { Player, GameRound, GameDetails } from "@/lib/types";
import { calculateRoundScores } from "@/lib/score-parser";
import { RulesContext } from "./rules-provider";
import { format } from "date-fns";


const mockPlayers: Player[] = [
  { id: "1", name: "jo" },
  { id: "2", name: "so" },
  { id: "3", name: "fo" },
];

const mockRounds: GameRound[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  playerStatus: {
    "1": "",
    "2": "",
    "3": "",
  },
  scores: {},
}));

interface GameContextType {
  players: Player[];
  updatePlayers: (newPlayers: Player[]) => void;
  rounds: GameRound[];
  setRounds: React.Dispatch<React.SetStateAction<GameRound[]>>;
  gameDetails: GameDetails;
  setGameDetails: React.Dispatch<React.SetStateAction<GameDetails>>;
  handleStatusChange: (roundId: number, playerId: string, rawInput: string) => void;
  resetGame: () => void;
  totalScores: Record<string, number>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [rounds, setRounds] = useState<GameRound[]>(mockRounds);
  const [gameDetails, setGameDetails] = useState<GameDetails>({
    location: "Chennai",
    teamName: "Team 1",
    date: format(new Date(), 'yyyy-MM-dd'),
    is3CardGame: true,
  });

  const rulesContext = useContext(RulesContext);
  if (!rulesContext) {
    throw new Error("GameProvider must be used within a RulesProvider");
  }
  const { rules } = rulesContext;

  const recalculateAllRounds = useCallback((currentRounds: GameRound[], newPlayers: Player[]) => {
    return currentRounds.map(r => {
      const newScores = calculateRoundScores(r.playerStatus, newPlayers, rules, gameDetails.is3CardGame);
      return { ...r, scores: newScores };
    });
  }, [rules, gameDetails.is3CardGame]);

  const updatePlayers = useCallback((newPlayers: Player[]) => {
    setPlayers(newPlayers);
    setRounds(prevRounds => recalculateAllRounds(prevRounds, newPlayers));
  }, [recalculateAllRounds]);


  const handleStatusChange = useCallback((roundId: number, playerId: string, rawInput: string) => {
    setRounds(prevRounds => {
      return prevRounds.map(r => {
        if (r.id === roundId) {
          const newPlayerStatus = { ...r.playerStatus, [playerId]: rawInput };
          const newScores = calculateRoundScores(newPlayerStatus, players, rules, gameDetails.is3CardGame);
          return { ...r, playerStatus: newPlayerStatus, scores: newScores };
        }
        return r;
      });
    });
  }, [players, rules, gameDetails.is3CardGame]);

  const resetGame = () => {
    setRounds(Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      playerStatus: {},
      scores: {},
    })));
  };

  const totalScores = useMemo(() => {
    const totals: Record<string, number> = {};
    players.forEach(p => totals[p.id] = 0);
    rounds.forEach(round => {
      Object.entries(round.scores).forEach(([playerId, score]) => {
        if (totals[playerId] !== undefined) {
          totals[playerId] += score;
        }
      });
    });
    return totals;
  }, [rounds, players]);

  const value = {
    players,
    updatePlayers,
    rounds,
    setRounds,
    gameDetails,
    setGameDetails,
    handleStatusChange,
    resetGame,
    totalScores
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
