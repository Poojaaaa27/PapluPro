import type { Player, GameRules } from "./types";

/**
 * Parses a player's status code for a single round and calculates their individual point value.
 * This function calculates the value as if the player is a loser. The winner's final score
 * is handled separately in calculateRoundScores.
 * @param code The player's status code (e.g., "1P-25", "MS").
 * @param rules The current game rules with point values.
 * @returns The calculated point value for that player's status.
 */
export function parsePlayerStatus(code: string, rules: GameRules): number {
    const upperCode = code.toUpperCase().trim();
    let score = 0;

    // If the code is just a number, use that as the score.
    if (!isNaN(Number(upperCode))) {
        return Number(upperCode);
    }
    
    // Split code at the hyphen to handle complex inputs like "1P-25"
    const parts = upperCode.split('-');

    for (const part of parts) {
        // Paplu detection
        const papluMatch = part.match(/(\d+)P/);
        if (papluMatch) {
            const papluCount = parseInt(papluMatch[1], 10);
            if (papluCount === 1) score += rules.singlePaplu;
            else if (papluCount === 2) score += rules.doublePaplu;
            else if (papluCount === 3) score += rules.triplePaplu;
            continue; // Move to next part
        }

        // Status code detection
        if (part.includes("F")) {
            score += rules.full;
        } else if (part.includes("MS")) {
            score += rules.midScoot;
        } else if (part.includes("S")) {
            score += rules.scoot;
        }

        // Standalone numeric value detection
        const numeralMatch = part.match(/^\d+$/);
        if (numeralMatch) {
            score += parseInt(numeralMatch[0], 10) * rules.perPoint;
        }
    }

    return score;
}

/**
 * Calculates the scores for all players for a single round based on their status codes.
 * @param playerStatus A record of player IDs to their status codes for the round.
 * @param players An array of all players in the game.
 * @param rules The current game rules.
 * @returns A record of player IDs to their calculated scores for the round.
 */
export function calculateRoundScores(
    playerStatus: Record<string, string>,
    players: Player[],
    rules: GameRules
): Record<string, number> {
    const scores: Record<string, number> = {};
    const winners: string[] = [];
    const loserPoints: Record<string, number> = {};
    let totalLoserPoints = 0;

    // Initialize scores and find winners
    players.forEach(player => {
        scores[player.id] = 0;
        const status = (playerStatus[player.id] || "").trim().toUpperCase();
        if (status.includes("3C")) {
            winners.push(player.id);
        }
    });

    // Case 1: Exactly one winner
    if (winners.length === 1) {
        const winnerId = winners[0];

        // Calculate points for all losers
        players.forEach(player => {
            if (player.id !== winnerId) {
                const status = playerStatus[player.id] || "";
                const points = parsePlayerStatus(status, rules);
                loserPoints[player.id] = -points;
                totalLoserPoints += points;
            }
        });
        
        // The winner also gets points for their own status (e.g., paplus)
        const winnerStatus = playerStatus[winnerId] || "";
        const winnerBonusPoints = parsePlayerStatus(winnerStatus, rules);
        totalLoserPoints += winnerBonusPoints;

        // Assign all points
        Object.assign(scores, loserPoints);
        scores[winnerId] = totalLoserPoints;

        return scores;
    }

    // Case 2: No winners, calculate individual negative scores
    if (winners.length === 0) {
        players.forEach(player => {
            const status = playerStatus[player.id] || "";
            scores[player.id] = -parsePlayerStatus(status, rules);
        });
        return scores;
    }
    
    // Case 3: Invalid state (multiple winners or other issues), return all zeros
    players.forEach(p => scores[p.id] = 0);
    return scores;
}
