"use client";

import React, { createContext, useState, useMemo, useCallback, ReactNode } from "react";
import type { Player, GameRound } from "@/lib/types";
import { calculateRoundScores } from "@/lib/score-parser";

const mockPlayers: Player[] = [
  { id: "1", name: "jo" },
  { id: "2", name: "so" },
  { id: "3", name: "fo" },
];

const mockRounds: GameRound[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  playerStatus: {},
  scores: {},
}));

interface GameContextType {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  rounds: GameRound[];
  setRounds: React.Dispatch<React.SetStateAction<GameRound[]>>;
  gameDetails: { location: string; teamName: string; date: string; };
  setGameDetails: React.Dispatch<React.SetStateAction<{ location: string; teamName: string; date: string; }>>;
  handleStatusChange: (roundId: number, playerId: string, status: string) => void;
  resetGame: () => void;
  totalScores: Record<string, number>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [rounds, setRounds] = useState<GameRound[]>(mockRounds);
  const [gameDetails, setGameDetails] = useState({
    location: "Chennai",
    teamName: "Team 1",
    date: "2025-08-12"
  });

  const handleStatusChange = useCallback((roundId: number, playerId: string, status: string) => {
    setRounds(prevRounds => {
      const newRounds = prevRounds.map(r => {
        if (r.id === roundId) {
          const newPlayerStatus = { ...r.playerStatus, [playerId]: status };
          const newScores = calculateRoundScores(newPlayerStatus, players);
          return { ...r, playerStatus: newPlayerStatus, scores: newScores };
        }
        return r;
      });
      return newRounds;
    });
  }, [players]);

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
    setPlayers,
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
