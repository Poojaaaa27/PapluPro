export type UserRole = "organizer" | "player" | "viewer";

export interface User {
  name: string;
  role: UserRole;
}

export interface Player {
  id: string;
  name: string;
}

export type PapluType = "single" | "double" | "triple" | null;

export interface GameRound {
  id: number;
  // Raw input strings for each player
  playerStatus: Record<string, string>; // Player ID -> status code e.g., "3C", "1P-25"
  // Calculated scores
  scores: Record<string, number>; // Player ID -> score
}


export interface GameSession {
  id: string;
  location: string;
  date: string;
  teamName: string; 
  players: Player[];
  rounds: GameRound[];
  status: "Completed" | "In Progress" | "Not Started";
}
