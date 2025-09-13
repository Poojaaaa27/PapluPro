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
  winnerId: string;
  paplu: PapluType;
  scoot: boolean;
  midScoot: boolean;
  full: boolean;
  attaKasu: boolean;
  scores: Record<string, number>; // Player ID -> score
  pointValue: number;
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
