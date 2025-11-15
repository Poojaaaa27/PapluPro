
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import type { GameSession } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";


const MOCK_HISTORY: GameSession[] = [
  // ... mock data if you had any
];

interface HistoryContextType {
  gameHistory: GameSession[];
  addGameSession: (session: Omit<GameSession, 'id'>) => void;
  deleteGameSession: (sessionId: string) => void;
  updateGameSession: (sessionId: string, updatedSession: GameSession) => void;
  loading: boolean;
}

export const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Used to key localStorage data

  const getStorageKey = () => `paplu-pro-history-${user?.id || 'default'}`;

  useEffect(() => {
    setLoading(true);
    if (user) {
        try {
            const storedHistory = localStorage.getItem(getStorageKey());
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory).map((session: GameSession) => ({
                    ...session,
                    is3CardGame: session.is3CardGame !== undefined ? session.is3CardGame : true
                }));
                setGameHistory(parsedHistory);
            } else {
                setGameHistory(MOCK_HISTORY); // or an empty array
            }
        } catch (error) {
            console.error("Failed to parse history from localStorage", error);
            setGameHistory(MOCK_HISTORY); // or an empty array
        }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user && !loading) {
        try {
            localStorage.setItem(getStorageKey(), JSON.stringify(gameHistory));
        } catch (error) {
            console.error("Failed to save history to localStorage", error);
        }
    }
  }, [gameHistory, user, loading]);

  const addGameSession = (session: Omit<GameSession, 'id'>) => {
    const newSession: GameSession = {
      ...session,
      id: `${Date.now()}-${Math.random()}`,
    };
    setGameHistory(prevHistory => [...prevHistory, newSession]);
  };

  const deleteGameSession = (sessionId: string) => {
    setGameHistory(prevHistory => prevHistory.filter(session => session.id !== sessionId));
  };
  
  const updateGameSession = (sessionId: string, updatedSession: GameSession) => {
    setGameHistory(prevHistory => 
      prevHistory.map(session => 
        session.id === sessionId ? updatedSession : session
      )
    );
  };

  const value = {
    gameHistory,
    addGameSession,
    deleteGameSession,
    updateGameSession,
    loading,
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}
