
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
    
    // 'D' and 'G' are markers and don't have point values themselves in this model.
    if (upperCode === "D" || upperCode === "G") return 0;

    let score = 0;
    
    // Regex to find different parts of the code.
    const papluMatch = upperCode.match(/(\d+)P/);
    const statusMatch = upperCode.match(/(MS|S|F)/);
    // This regex looks for a numeric part, which might be standalone or after a hyphen.
    const numericPartMatch = upperCode.split('-').pop()?.match(/^\d+$/);

    // Add points for Status (S, MS, F)
    if (statusMatch) {
        const status = statusMatch[1];
        if (status === "S") score += rules.scoot;
        else if (status === "MS") score += rules.midScoot;
        else if (status === "F") score += rules.full;
    }
    
    // Add points from numeric value
    if (numericPartMatch) {
        score += parseInt(numericPartMatch[0], 10) * rules.perPoint;
    }

    // Add points for Paplu (Paplu is a penalty for losers, bonus for winners, handled in calculateRoundScores)
    if (papluMatch) {
        const papluCount = parseInt(papluMatch[1], 10);
        if (papluCount === 1) score += rules.singlePaplu;
        else if (papluCount === 2) score += rules.doublePaplu;
        else if (papluCount === 3) score += rules.triplePaplu;
    }


    return score;
}

/**
 * Calculates the scores for all players for a single round based on their status codes.
 * This function enforces the rule that there must be exactly one winner (3C) if it's a 3-card game.
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

    const winners = players.filter(p => (playerStatus[p.id] || "").toUpperCase().includes("3C"));
    
    // --- 3 Card Game Logic ---
    if (is3CardGame) {
        // A 3-card game round is only valid if there is exactly one winner.
        if (winners.length === 1) {
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
            const winnerStatus = playerStatus[winnerId] || "";
            const winnerBonusPoints = parsePlayerStatus(winnerStatus, rules);
            totalLoserPoints += winnerBonusPoints;

            // Assign final score to winner
            scores[winnerId] = totalLoserPoints;

            return scores;
        } else if (winners.length > 1) {
            // Invalid round if more than one winner
            return scores; // Return all zeros
        }
    }
    
    // --- Default Scoring Logic (No winner or not a 3-card game) ---
    // Score everyone individually as a loser.
    players.forEach(player => {
        const status = (playerStatus[player.id] || "").trim();
        if (status) {
            // Winners in a non-3-card game or a round with no single winner just get 0 for themselves.
            if ((playerStatus[player.id] || "").toUpperCase().includes("3C")) {
                 scores[player.id] = 0;
            } else {
                 scores[player.id] = -parsePlayerStatus(status, rules);
            }
        }
    });
    return scores;
}
