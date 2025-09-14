
import type { Player } from "./types";

export function parsePlayerStatus(code: string): number {
    const upperCode = code.toUpperCase();

    if (upperCode.includes("3C")) {
        return 0; // Winner's own cell score is 0
    }

    let score = 0;
    
    // Numeral points can exist with other codes
    const numeralMatch = upperCode.match(/-?(\d+)/);
    if (numeralMatch) {
        score = parseInt(numeralMatch[1], 10);
    }

    // Game status points (only if no numeral is present)
    if (!numeralMatch) {
        if (upperCode.includes("S")) score = 10;
        if (upperCode.includes("MS")) score = 20;
        if (upperCode.includes("F")) score = 40;
    }
    
    // Paplu reductions (can apply to any loser score)
    if (upperCode.includes("1P")) score -= 10;
    if (upperCode.includes("2P")) score -= 30;
    if (upperCode.includes("3P")) score -= 50;

    return Math.max(0, score);
}

export function calculateRoundScores(
    playerStatus: Record<string, string>,
    players: Player[]
): Record<string, number> {
    const scores: Record<string, number> = {};
    let winnerId: string | null = null;
    let totalLoserPoints = 0;

    // Initialize scores and find the winner
    players.forEach(player => {
        const status = playerStatus[player.id] || "";
        scores[player.id] = 0; // Default score
        if (status.toUpperCase().includes("3C")) {
            winnerId = player.id;
        }
    });

    // If no winner, all scores are 0
    if (!winnerId) {
        players.forEach(p => scores[p.id] = 0);
        return scores;
    }
    
    // Calculate loser points and sum them up
    players.forEach(player => {
        if (player.id !== winnerId) {
            const status = playerStatus[player.id] || "";
            const points = parsePlayerStatus(status);
            scores[player.id] = -points;
            totalLoserPoints += points;
        }
    });

    // Assign total loser points to the winner
    if (winnerId) {
        scores[winnerId] = totalLoserPoints;
    }

    return scores;
}
