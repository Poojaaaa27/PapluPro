"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import type { Team, Player } from "@/lib/types";

interface TeamsContextType {
  teams: Team[];
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (teamId: string, updatedData: Partial<Omit<Team, 'id'>>) => void;
  deleteTeam: (teamId: string) => void;
  getTeamById: (teamId: string) => Team | undefined;
  loading: boolean;
}

export const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

const MOCK_TEAMS: Team[] = [
    {
        id: 'team-1',
        name: 'The High Rollers',
        players: [
            { id: "1", name: "jo" },
            { id: "2", name: "so" },
            { id: "3", name: "fo" },
        ]
    },
    {
        id: 'team-2',
        name: 'The Card Sharks',
        players: [
            { id: "4", name: "Player A" },
            { id: "5", name: "Player B" },
            { id: "6", name: "Player C" },
            { id: "7", name: "Player D" },
        ]
    }
]

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedTeams = localStorage.getItem("paplu-pro-teams");
      if (storedTeams) {
        setTeams(JSON.parse(storedTeams));
      } else {
        // Load mock teams if no teams are in local storage
        setTeams(MOCK_TEAMS);
        updateLocalStorage(MOCK_TEAMS);
      }
    } catch (error) {
      console.error("Failed to parse teams from localStorage", error);
      localStorage.removeItem("paplu-pro-teams");
      setTeams(MOCK_TEAMS);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocalStorage = (updatedTeams: Team[]) => {
    localStorage.setItem("paplu-pro-teams", JSON.stringify(updatedTeams));
  };

  const addTeam = (teamData: Omit<Team, 'id'>) => {
    const newTeam: Team = { ...teamData, id: `${Date.now()}` };
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    updateLocalStorage(updatedTeams);
  };

  const updateTeam = (teamId: string, updatedData: Partial<Omit<Team, 'id'>>) => {
    const updatedTeams = teams.map(team =>
      team.id === teamId ? { ...team, ...updatedData } : team
    );
    setTeams(updatedTeams);
    updateLocalStorage(updatedTeams);
  };

  const deleteTeam = (teamId: string) => {
    const updatedTeams = teams.filter(team => team.id !== teamId);
    setTeams(updatedTeams);
    updateLocalStorage(updatedTeams);
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
