"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import type { GameSession } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { collection, onSnapshot, addDoc, deleteDoc, doc, getFirestore } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface HistoryContextType {
  gameHistory: GameSession[];
  addGameSession: (session: Omit<GameSession, 'id'>) => void;
  deleteGameSession: (sessionId: string) => void;
  loading: boolean;
}

export const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { firestore } = useFirebase();

  useEffect(() => {
    if (!firestore || !user) {
      setLoading(false);
      return;
    };
    
    const historyCollectionRef = collection(firestore, "gameSessions");
    
    const unsubscribe = onSnapshot(historyCollectionRef, (snapshot) => {
      const history: GameSession[] = [];
      snapshot.forEach(doc => {
        history.push({ id: doc.id, ...doc.data() } as GameSession);
      });
      // sort by date ascending
      history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setGameHistory(history);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching game history:", error);
      setLoading(false);
    });

    return () => unsubscribe();

  }, [firestore, user]);


  const addGameSession = (session: Omit<GameSession, 'id'>) => {
    if (!firestore) return;
    const historyCollectionRef = collection(firestore, "gameSessions");
    addDocumentNonBlocking(historyCollectionRef, session);
  };

  const deleteGameSession = (sessionId: string) => {
    if (!firestore) return;
    const gameDocRef = doc(firestore, "gameSessions", sessionId);
    deleteDocumentNonBlocking(gameDocRef);
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
