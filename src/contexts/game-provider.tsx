
"use client";

import React, { createContext, useState, useMemo, useCallback, ReactNode, useContext, useEffect } from "react";
import type { Player, GameRound, GameDetails, PlayerStatus } from "@/lib/types";
import { calculateRoundScores } from "@/lib/score-parser";
import { RulesContext } from "./rules-provider";
import { format } from "date-fns";


const mockPlayers: Player[] = [
  { id: "1", name: "jo" },
  { id: "2", name: "so" },
  { id: "3", name: "fo" },
];

const defaultPlayerStatus: PlayerStatus = {
  is3C: false,
  papluCount: 0,
  outcome: 'Playing',
  points: 0,
  isGate: false,
};

const getDefaultPlayerStatuses = (players: Player[]): Record<string, PlayerStatus> => {
    const statuses: Record<string, PlayerStatus> = {};
    players.forEach(p => {
        statuses[p.id] = { ...defaultPlayerStatus };
    });
    return statuses;
}


const mockRounds: GameRound[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  playerStatus: getDefaultPlayerStatuses(mockPlayers),
  scores: {},
}));

interface GameContextType {
  players: Player[];
  updatePlayers: (newPlayers: Player[]) => void;
  rounds: GameRound[];
  setRounds: React.Dispatch<React.SetStateAction<GameRound[]>>;
  gameDetails: GameDetails;
  setGameDetails: React.Dispatch<React.SetStateAction<GameDetails>>;
  handleStatusChange: (roundId: number, playerId: string, newStatus: PlayerStatus) => void;
  resetGame: () => void;
  totalScores: Record<string, number>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  
  const [rounds, setRounds] = useState<GameRound[]>(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      playerStatus: getDefaultPlayerStatuses(players),
      scores: {},
    }))
  );

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

  const recalculateAllRounds = useCallback((currentRounds: GameRound[], currentPlayers: Player[]) => {
    return currentRounds.map(r => {
      // Filter out statuses of players who are no longer in the game
      const relevantPlayerStatus: Record<string, PlayerStatus> = {};
      currentPlayers.forEach(p => {
        if (r.playerStatus[p.id]) {
          relevantPlayerStatus[p.id] = r.playerStatus[p.id];
        } else {
          // If a new player was added, give them a default status for existing rounds
          relevantPlayerStatus[p.id] = { ...defaultPlayerStatus };
        }
      });
      
      const newScores = calculateRoundScores(relevantPlayerStatus, currentPlayers, rules, gameDetails.is3CardGame);
      return { ...r, playerStatus: relevantPlayerStatus, scores: newScores };
    });
  }, [rules, gameDetails.is3CardGame]);


  const updatePlayers = useCallback((newPlayers: Player[]) => {
    setPlayers(newPlayers);
    // When players update, we need to recalculate all rounds with the new player list
    setRounds(prevRounds => recalculateAllRounds(prevRounds, newPlayers));
  }, [recalculateAllRounds]);


  const handleStatusChange = useCallback((roundId: number, playerId: string, newStatus: PlayerStatus) => {
    setRounds(prevRounds => {
      return prevRounds.map(r => {
        if (r.id === roundId) {
          const newPlayerStatus = { ...r.playerStatus, [playerId]: newStatus };
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
      playerStatus: getDefaultPlayerStatuses(players),
      scores: {},
    })));
  };

  const totalScores = useMemo(() => {
    const totals: Record<string, number> = {};
    players.forEach(p => totals[p.id] = 0);
    rounds.forEach(round => {
      // Only include scores for current players
      players.forEach(player => {
        if (round.scores[player.id]) {
          totals[player.id] += round.scores[player.id];
        }
      })
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
