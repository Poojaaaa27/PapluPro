import type { Player, GameRules } from "./types";

export function parsePlayerStatus(code: string, rules: GameRules): number {
    const upperCode = code.toUpperCase().trim();

    // Winners are not losers. If "3C" is present, they don't get negative points.
    if (upperCode.includes("3C")) {
        return 0; 
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
        const cardPoints = parseInt(numeralMatch[0], 10);
        score += cardPoints * rules.perPoint;
    }
    
    // Apply paplu reductions for losers
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

    // Initialize scores and find all potential winners
    players.forEach(player => {
        const status = (playerStatus[player.id] || "").trim().toUpperCase();
        scores[player.id] = 0; 
        if (status.includes("3C")) {
            winners.push(player.id);
        }
    });

    // Case 1: One or more players are marked as winner. Prioritize the first one.
    if (winners.length >= 1) {
        const winnerId = winners[0]; // Prioritize the first winner found
        
        // Calculate loser points and sum them up
        players.forEach(player => {
            if (player.id !== winnerId) {
                const status = playerStatus[player.id] || "";
                const points = parsePlayerStatus(status, rules);
                scores[player.id] = -points;
                totalLoserPoints += points;
            }
        });
        
        // The winner also gets points for their own paplus, if any
        const winnerStatus = (playerStatus[winnerId] || "").trim().toUpperCase();
        if (winnerStatus.includes("3P")) totalLoserPoints += rules.triplePaplu;
        else if (winnerStatus.includes("2P")) totalLoserPoints += rules.doublePaplu;
        else if (winnerStatus.includes("1P")) totalLoserPoints += rules.singlePaplu;

        // Assign final points to the winner
        scores[winnerId] = totalLoserPoints;

        return scores;
    }

    // Case 2: No winners in the round. Calculate individual scores.
    if (winners.length === 0) {
        players.forEach(player => {
            const status = playerStatus[player.id] || "";
            const points = parsePlayerStatus(status, rules);
            scores[player.id] = -points;
        });
        return scores;
    }

    // Fallback for any other state (should not be reached)
    players.forEach(p => scores[p.id] = 0);
    return scores;
}
