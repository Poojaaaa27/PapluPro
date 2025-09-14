import type { Player, GameRules } from "./types";

/**
 * Parses a player's status code for a single round and calculates their individual point value.
 * This function is designed to handle complex, hyphenated codes and various combinations.
 * @param code The player's status code (e.g., "1P-25", "MS", "3C2P-F").
 * @param rules The current game rules with point values.
 * @returns The calculated point value for that player's status code.
 */
export function parsePlayerStatus(code: string, rules: GameRules): number {
    const upperCode = code.toUpperCase().trim();
    if (!upperCode) return 0;
    
    // Treat 'D' and 'G' as 0 points unless specified otherwise in rules
    if (upperCode === "D" || upperCode === "G") return 0;

    let score = 0;
    
    // Regex to find paplu counts, statuses, and explicit numbers.
    const papluMatch = upperCode.match(/(\d+)P/);
    const statusMatch = upperCode.match(/(MS|S|F)/);
    const numericMatch = upperCode.match(/(\d+)$/); // Number at the end of a string or part.

    // Add points for Paplu
    if (papluMatch) {
        const papluCount = parseInt(papluMatch[1], 10);
        if (papluCount === 1) score += rules.singlePaplu;
        else if (papluCount === 2) score += rules.doublePaplu;
        else if (papluCount === 3) score += rules.triplePaplu;
    }

    // Add points for Status (S, MS, F)
    if (statusMatch) {
        const status = statusMatch[1];
        if (status === "S") score += rules.scoot;
        else if (status === "MS") score += rules.midScoot;
        else if (status === "F") score += rules.full;
    }
    
    // Add points from numeric value, ensuring it's not part of a paplu code.
    // This looks for numbers at the end of the code or after a hyphen.
    const parts = upperCode.split('-');
    const lastPart = parts[parts.length - 1];
    const numericPartMatch = lastPart.match(/^\d+$/); // e.g., the '10' in '3C-10' or just '10'
    if (numericPartMatch) {
        score += parseInt(numericPartMatch[0], 10) * rules.perPoint;
    }

    return score;
}

/**
 * Calculates the scores for all players for a single round based on their status codes.
 * This function enforces the rule that there must be exactly one winner (3C) and at least one declarer (D).
 * @param playerStatus A record of player IDs to their status codes for the round.
 * @param players An array of all players in the game.
 * @param rules The current game rules.
 * @param is3CardGame A boolean indicating if it's a 3-card game.
 * @returns A record of player IDs to their calculated scores for the round.
 */
export function calculateRoundScores(
    playerStatus: Record<string, string>,
    players: Player[],
    rules: GameRules,
    is3CardGame: boolean
): Record<string, number> {
    const scores: Record<string, number> = {};
    players.forEach(p => scores[p.id] = 0);

    // If not a 3-card game, score everyone individually as a loser.
    if (!is3CardGame) {
        players.forEach(player => {
            const status = (playerStatus[player.id] || "").trim();
            if (status) {
                scores[player.id] = -parsePlayerStatus(status, rules);
            }
        });
        return scores;
    }

    // --- 3 Card Game Logic ---
    const winners = players.filter(p => (playerStatus[p.id] || "").toUpperCase().includes("3C"));
    
    // A 3-card game round is only valid if there is exactly one winner.
    if (winners.length !== 1) {
        return scores; // Return all zeros for an invalid round
    }
    
    const winnerId = winners[0].id;
    let totalLoserPoints = 0;

    // Calculate points for all losers
    players.forEach(player => {
        if (player.id !== winnerId) {
            const status = playerStatus[player.id] || "";
            const points = parsePlayerStatus(status, rules);
            scores[player.id] = -points;
            totalLoserPoints += points;
        }
    });

    // Add Atta Kasu for each loser
    const loserCount = players.length - 1;
    totalLoserPoints += loserCount * rules.attaKasu;

    // The winner also gets points for their own status (e.g., paplus, scoot in their hand)
    // The "3C" itself doesn't have a value, but other parts of the code do.
    const winnerStatus = playerStatus[winnerId] || "";
    const winnerBonusPoints = parsePlayerStatus(winnerStatus, rules);
    totalLoserPoints += winnerBonusPoints;

    // Assign final score to winner
    scores[winnerId] = totalLoserPoints;

    return scores;
}
