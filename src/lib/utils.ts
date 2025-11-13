
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PlayerStatus, GameRound } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusString(status: PlayerStatus, round?: GameRound): string {
    if (!status) return "";
    
    if (round?.isSpecial) {
        const parts: string[] = [];
        if (status.is3C) parts.push("3C");
        return parts.length > 0 ? parts.join(', ') : "0";
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
            if(status.points !== null) postRoundParts.push(`${status.points}`);
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

    return preRoundString || postRoundString;
}
