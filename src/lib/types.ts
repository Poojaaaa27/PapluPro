
export type UserRole = "organizer" | "viewer";

export interface User {
  name: string;
  role: UserRole;
}

export interface Player {
  id: string;
  name: string;
}

export interface PlayerRoundStatus {
  rawInput: string;
}

export interface GameRound {
  id: number;
  playerStatus: Record<string, string>; // Player ID -> raw input string
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
