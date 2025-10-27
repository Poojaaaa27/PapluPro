
"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import type { GameSession } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { collection, onSnapshot, addDoc, deleteDoc, doc, getFirestore, query, where } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

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
      setGameHistory([]);
      return;
    };
    
    setLoading(true);
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
    }, (err) => {
      const contextualError = new FirestorePermissionError({
        path: historyCollectionRef.path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', contextualError);
      setLoading(false);
    });

    return () => unsubscribe();

  }, [firestore, user]);


  const addGameSession = (session: Omit<GameSession, 'id'>) => {
    if (!firestore) return;
    const historyCollectionRef = collection(firestore, "gameSessions");
    // Use the non-blocking helper which will handle permission errors
    addDocumentNonBlocking(historyCollectionRef, session);
  };

  const deleteGameSession = (sessionId: string) => {
    if (!firestore) return;
    const gameDocRef = doc(firestore, "gameSessions", sessionId);
    // Use the non-blocking helper which will handle permission errors
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
