
"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import type { Team, Player } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getFirestore } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

interface TeamsContextType {
  teams: Team[];
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (teamId: string, updatedData: Partial<Omit<Team, 'id'>>) => void;
  deleteTeam: (teamId: string) => void;
  getTeamById: (teamId: string) => Team | undefined;
  loading: boolean;
}

export const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { firestore } = useFirebase();


  useEffect(() => {
    if (!firestore || !user) {
        setLoading(false);
        setTeams([]);
        return;
    };

    setLoading(true);
    const teamsCollectionRef = collection(firestore, "teams");

    const unsubscribe = onSnapshot(teamsCollectionRef, (snapshot) => {
        const teamsData: Team[] = [];
        snapshot.forEach(doc => {
            teamsData.push({ id: doc.id, ...doc.data() } as Team);
        });
        setTeams(teamsData);
        setLoading(false);
    }, (err) => {
        const contextualError = new FirestorePermissionError({
            path: teamsCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user]);

  const addTeam = (teamData: Omit<Team, 'id'>) => {
    if (!firestore) return;
    const teamsCollectionRef = collection(firestore, "teams");
    addDocumentNonBlocking(teamsCollectionRef, teamData);
  };

  const updateTeam = (teamId: string, updatedData: Partial<Omit<Team, 'id'>>) => {
    if (!firestore) return;
    const teamDocRef = doc(firestore, "teams", teamId);
    updateDocumentNonBlocking(teamDocRef, updatedData);
  };

  const deleteTeam = (teamId: string) => {
    if (!firestore) return;
    const teamDocRef = doc(firestore, "teams", teamId);
    deleteDocumentNonBlocking(teamDocRef);
  };
  
  const getTeamById = (teamId: string) => {
    return teams.find(team => team.id === teamId);
  }

  const value = {
    teams,
    addTeam,
    updateTeam,
    deleteTeam,
    getTeamById,
    loading,
  };

  return (
    <TeamsContext.Provider value={value}>
      {children}
    </TeamsContext.Provider>
  );
}
