"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import type { GameSession } from "@/lib/types";

interface HistoryContextType {
  gameHistory: GameSession[];
  addGameSession: (session: GameSession) => void;
  deleteGameSession: (sessionId: string) => void;
  loading: boolean;
}

export const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("paplu-pro-history");
      if (storedHistory) {
        setGameHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      localStorage.removeItem("paplu-pro-history");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocalStorage = (history: GameSession[]) => {
    localStorage.setItem("paplu-pro-history", JSON.stringify(history));
  };

  const addGameSession = (session: GameSession) => {
    const updatedHistory = [...gameHistory, session];
    setGameHistory(updatedHistory);
    updateLocalStorage(updatedHistory);
  };

  const deleteGameSession = (sessionId: string) => {
    const updatedHistory = gameHistory.filter(session => session.id !== sessionId);
    setGameHistory(updatedHistory);
    updateLocalStorage(updatedHistory);
  };

  const value = {
    gameHistory,
    addGameSession,
    deleteGameSession,
    loading,
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}
