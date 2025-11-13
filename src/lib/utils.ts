
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

    if (status.outcome === 'Playing' && status.points === 0 && !status.is3C && status.papluCount === 0 && !status.isGate) {
      return "Set Status";
    }
    
    if (round?.isSpecial) {
        return "0";
    }

    const preRoundParts: string[] = [];
    const postRoundParts: string[] = [];

    // Pre-round bonuses / special cards
    if (status.is3C) preRoundParts.push("3C");
    if (status.papluCount > 0) preRoundParts.push(`${status.papluCount}P`);
    if (status.isGate) preRoundParts.push('G');
    
    // Post-round outcome
    switch(status.outcome) {
        case 'Winner':
            postRoundParts.push('D');
            break;
        case 'Playing':
            if(status.points !== null) {
                // For playing, points can be 0. We want to display it.
                postRoundParts.push(`${status.points}`);
            }
            break;
        case 'Full':
            postRoundParts.push('F');
            break;
        case 'Scoot':
            postRoundParts.push('S');
            break;
        case 'MidScoot':
            postRoundParts.push('MS');
            break;
    }

    const preRoundString = preRoundParts.join(', ');
    const postRoundString = postRoundParts.join(', ');

    if (preRoundString && postRoundString && postRoundString !== "null") {
        return `${preRoundString} | ${postRoundString}`;
    }
    
    const result = postRoundString !== "null" ? postRoundString || preRoundString : preRoundString;
    return result === "" ? "Set Status" : result;
}
