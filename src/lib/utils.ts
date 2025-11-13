
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PlayerStatus, GameRound } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusString(status: PlayerStatus, round?: GameRound): string {
    if (!status) return "Set Status";
    
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
            } else {
                 // This case should ideally not happen if we default to 0, but as a fallback.
                postRoundParts.push('0');
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

    if (preRoundString && postRoundString) {
        return `${preRoundString} | ${postRoundString}`;
    }
    
    const result = preRoundString || postRoundString;
    return result === "" ? "Set Status" : result;
}

