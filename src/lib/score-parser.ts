
import type { Player } from "./types";

export function parsePlayerStatus(code: string): number {
    const upperCode = code.toUpperCase();

    if (upperCode.includes("3C")) {
        return 0; // Winner's own cell score is 0
    }

    let score = 0;
    
    const numeralMatch = upperCode.match(/-?(\d+)/);
    if (numeralMatch) {
        score = parseInt(numeralMatch[1], 10);
    } else {
        if (upperCode.includes("S")) score = 10;
        if (upperCode.includes("MS")) score = 20;
        if (upperCode.includes("F")) score = 40;
    }
    
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
    const winners: string[] = [];
    let totalLoserPoints = 0;

    // Initialize scores and find winners
    players.forEach(player => {
        const status = playerStatus[player.id] || "";
        scores[player.id] = 0; // Default score
        if (status.toUpperCase().includes("3C")) {
            winners.push(player.id);
        }
    });

    // If there is not exactly one winner, the round is invalid. All scores are 0.
    if (winners.length !== 1) {
        players.forEach(p => scores[p.id] = 0);
        return scores;
    }

    const winnerId = winners[0];
    
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
    scores[winnerId] = totalLoserPoints;

    return scores;
}
