
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PlayerStatus, GameRound } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusString(status: PlayerStatus, round?: GameRound): string {
    if (!status) {
      return "Set Status";
    }

    // A status is "unset" if it's the default state.
    if (status.outcome === 'Playing' && status.points === null && !status.is3C && status.papluCount === 0 && !status.isGate) {
      return "Set Status";
    }
    
    if (round?.isSpecial) {
        return "0";
    }

    const parts: string[] = [];

    // Pre-round bonuses / special cards
    if (status.is3C) parts.push("3C");
    if (status.papluCount > 0) parts.push(`${status.papluCount}P`);
    if (status.isGate) parts.push('G');
    
    // Post-round outcome
    switch(status.outcome) {
        case 'Winner':
            parts.push('D');
            break;
        case 'Playing':
            // Only show points when playing
            if (status.points !== null) {
                parts.push(`${status.points}`);
            }
            break;
        case 'Full':
            parts.push('F');
            break;
        case 'Scoot':
            parts.push('S');
            break;
        case 'MidScoot':
            parts.push('MS');
            break;
    }
    
    const result = parts.join(' | ');

    return result === "" ? "Set Status" : result;
}
