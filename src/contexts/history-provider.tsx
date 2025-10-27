"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import type { GameSession } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { collection, onSnapshot, addDoc, deleteDoc, doc, getFirestore } from "firebase/firestore";
import { FirebaseContext } from "./firebase-provider";

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
  const firebaseContext = useContext(FirebaseContext);

  useEffect(() => {
    if (!firebaseContext || !user) {
      setLoading(false);
      return;
    };
    const db = getFirestore(firebaseContext.app);
    
    const historyCollectionRef = collection(db, "gameSessions");
    
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

  }, [firebaseContext, user]);


  const addGameSession = async (session: Omit<GameSession, 'id'>) => {
    if (!firebaseContext) return;
    const db = getFirestore(firebaseContext.app);
    try {
      await addDoc(collection(db, "gameSessions"), session);
    } catch (error) {
      console.error("Error adding game session: ", error);
    }
  };

  const deleteGameSession = async (sessionId: string) => {
    if (!firebaseContext) return;
    const db = getFirestore(firebaseContext.app);
    try {
      await deleteDoc(doc(db, "gameSessions", sessionId));
    } catch (error) {
      console.error("Error deleting game session: ", error);
    }
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
