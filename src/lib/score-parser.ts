import type { Player, GameRules } from "./types";

export function parsePlayerStatus(code: string, rules: GameRules): number {
    const upperCode = code.toUpperCase().trim();

    if (upperCode.includes("3C")) {
        return 0; // Winners are not losers.
    }

    let score = 0;
    
    // First, check for S, MS, F
    if (upperCode.includes("F")) score = rules.full;
    else if (upperCode.includes("MS")) score = rules.midScoot;
    else if (upperCode.includes("S")) score = rules.scoot;
    
    // Regex to find any standalone numbers in the string.
    const numeralMatch = upperCode.match(/\d+/);
    if (numeralMatch) {
        // If a number is present, it is added to the score, multiplied by perPoint value.
        // This assumes the number represents card points.
        const cardPoints = parseInt(numeralMatch[0], 10);
        score += cardPoints * rules.perPoint;
    }
    
    // Apply paplu reductions
    if (upperCode.includes("3P")) score -= rules.triplePaplu;
    else if (upperCode.includes("2P")) score -= rules.doublePaplu;
    else if (upperCode.includes("1P")) score -= rules.singlePaplu;

    return Math.max(0, score);
}

export function calculateRoundScores(
    playerStatus: Record<string, string>,
    players: Player[],
    rules: GameRules
): Record<string, number> {
    const scores: Record<string, number> = {};
    const winners: string[] = [];
    let totalLoserPoints = 0;

    // Initialize scores and find winners
    players.forEach(player => {
        const status = (playerStatus[player.id] || "").trim().toUpperCase();
        scores[player.id] = 0; 
        if (status.includes("3C")) {
            winners.push(player.id);
        }
    });

    // If there's not exactly one winner, the round is invalid for scoring.
    if (winners.length !== 1) {
        players.forEach(p => scores[p.id] = 0);
        return scores;
    }

    const winnerId = winners[0];
    
    // Calculate loser points and sum them up
    players.forEach(player => {
        if (player.id !== winnerId) {
            const status = playerStatus[player.id] || "";
            const points = parsePlayerStatus(status, rules);
            scores[player.id] = -points;
            totalLoserPoints += points;
        }
    });
    
    // Check for paplus for the winner from their own status string
    const winnerStatus = (playerStatus[winnerId] || "").trim().toUpperCase();
    if (winnerStatus.includes("3P")) totalLoserPoints += rules.triplePaplu;
    else if (winnerStatus.includes("2P")) totalLoserPoints += rules.doublePaplu;
    else if (winnerStatus.includes("1P")) totalLoserPoints += rules.singlePaplu;

    // Assign final points to the winner
    scores[winnerId] = totalLoserPoints;

    return scores;
}
