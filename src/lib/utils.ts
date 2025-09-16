import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PlayerStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusString(status: PlayerStatus): string {
    if (!status) return "";
    
    const parts: string[] = [];

    if (status.is3C) parts.push("3C");
    if (status.papluCount > 0) parts.push(`${status.papluCount}P`);
    
    switch(status.outcome) {
        case 'Winner':
            parts.push('D');
            if (status.isGate) parts.push('G');
            break;
        case 'Playing':
            if(status.points > 0) parts.push(`-${status.points}`);
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

    return parts.join(', ');
}
