
import type { Player } from "./types";

export function parsePlayerStatus(code: string): number {
    const upperCode = code.toUpperCase();

    // This function is for calculating points for a losing player.
    // If the code contains 3C, it's a winner, and their individual points are 0 here.
    if (upperCode.includes("3C")) {
        return 0;
    }

    let score = 0;
    
    // Regex to find any numbers in the string.
    const numeralMatch = upperCode.match(/\d+/);
    
    // First, check for S, MS, F before checking for numerals.
    if (upperCode.includes("S")) score = 10;
    if (upperCode.includes("MS")) score = 20;
    if (upperCode.includes("F")) score = 40;
    
    // If a number is present, it overrides S, MS, F.
    if (numeralMatch) {
        score = parseInt(numeralMatch[0], 10);
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
        const status = (playerStatus[player.id] || "").trim().toUpperCase();
        scores[player.id] = 0; // Default score
        // A winner must contain '3C'
        if (status.includes("3C")) {
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
