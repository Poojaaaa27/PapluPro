

export type UserRole = "organizer" | "viewer";

export interface User {
  name: string;
  role: UserRole;
}

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export type RoundOutcome = "Winner" | "Playing" | "Full" | "Scoot" | "MidScoot";
export type PapluCount = 0 | 1 | 2 | 3;

export interface PlayerStatus {
  is3C: boolean;
  papluCount: PapluCount;
  outcome: RoundOutcome;
  points: number;
  isGate: boolean;
}

export interface GameRound {
  id: number;
  playerStatus: Record<string, PlayerStatus>; // Player ID -> structured status
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
  threeCardHand: number;
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
