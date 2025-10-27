
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import type { Team } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

const MOCK_TEAMS: Team[] = [
    { 
        id: '1', 
        name: 'The Sharks', 
        players: [{id: '1', name: 'Alice'}, {id: '2', name: 'Bob'}] 
    },
    { 
        id: '2', 
        name: 'The Jets', 
        players: [{id: '3', name: 'Charlie'}, {id: '4', name: 'Diana'}] 
    },
];

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
  
  const getStorageKey = () => `paplu-pro-teams-${user?.id || 'default'}`;

  useEffect(() => {
    if (user) {
        try {
            const storedTeams = localStorage.getItem(getStorageKey());
            if (storedTeams) {
                setTeams(JSON.parse(storedTeams));
            } else {
                setTeams(MOCK_TEAMS);
            }
        } catch (error) {
            console.error("Failed to parse teams from localStorage", error);
            setTeams(MOCK_TEAMS);
        } finally {
            setLoading(false);
        }
    }
  }, [user]);

  useEffect(() => {
    if (user && !loading) {
        try {
            localStorage.setItem(getStorageKey(), JSON.stringify(teams));
        } catch (error) {
            console.error("Failed to save teams to localStorage", error);
        }
    }
  }, [teams, user, loading]);

  const addTeam = (teamData: Omit<Team, 'id'>) => {
    const newTeam = { ...teamData, id: `${Date.now()}-${Math.random()}` };
    setTeams(prevTeams => [...prevTeams, newTeam]);
  };

  const updateTeam = (teamId: string, updatedData: Partial<Omit<Team, 'id'>>) => {
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.id === teamId ? { ...team, ...updatedData } : team
      )
    );
  };

  const deleteTeam = (teamId: string) => {
    setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
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
