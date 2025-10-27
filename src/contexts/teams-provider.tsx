"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import type { Team, Player } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getFirestore } from "firebase/firestore";
import { FirebaseContext } from "./firebase-provider";

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
  const firebaseContext = useContext(FirebaseContext);


  useEffect(() => {
    if (!firebaseContext || !user) {
        setLoading(false);
        return;
    };
    const db = getFirestore(firebaseContext.app);

    const teamsCollectionRef = collection(db, "teams");

    const unsubscribe = onSnapshot(teamsCollectionRef, (snapshot) => {
        const teamsData: Team[] = [];
        snapshot.forEach(doc => {
            teamsData.push({ id: doc.id, ...doc.data() } as Team);
        });
        setTeams(teamsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching teams:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseContext, user]);

  const addTeam = async (teamData: Omit<Team, 'id'>) => {
    if (!firebaseContext) return;
    const db = getFirestore(firebaseContext.app);
    try {
        await addDoc(collection(db, "teams"), teamData);
    } catch (error) {
        console.error("Error adding team: ", error);
    }
  };

  const updateTeam = async (teamId: string, updatedData: Partial<Omit<Team, 'id'>>) => {
    if (!firebaseContext) return;
    const db = getFirestore(firebaseContext.app);
    const teamDocRef = doc(db, "teams", teamId);
    try {
        await updateDoc(teamDocRef, updatedData);
    } catch (error) {
        console.error("Error updating team: ", error);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!firebaseContext) return;
    const db = getFirestore(firebaseContext.app);
    try {
        await deleteDoc(doc(db, "teams", teamId));
    } catch (error) {
        console.error("Error deleting team: ", error);
    }
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
