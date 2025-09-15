export type UserRole = "organizer" | "viewer";

export interface User {
  name: string;
  role: UserRole;
}

export interface Player {
  id: string;
  name: string;
}

export type PapluType = "single" | "double" | "triple" | null;

export interface PlayerRoundStatus {
  points: number;
  isWinner: boolean;
  isScoot: boolean;
  isMidScoot: boolean;
  isFull: boolean;
  isGate: boolean;
  is3C: boolean;
  papluCount: 0 | 1 | 2 | 3;
  rawInput: string; // For display purposes
}


export interface GameRound {
  id: number;
  // Structured input for each player
  playerStatus: Record<string, PlayerRoundStatus>; // Player ID -> status object
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

export interface GameRules {
  attaKasu: number;
  scoot: number;
  midScoot: number;
  full: number;
  perPoint: number;
  singlePaplu: number;
  doublePaplu: number;
  triplePaplu: number;
}

export interface GameDetails {
  location: string;
  teamName: string;
  date: string;
  is3CardGame: boolean;
}
