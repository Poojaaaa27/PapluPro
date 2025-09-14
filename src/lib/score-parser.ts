
import type { Player, GameRules } from "./types";

/**
 * Parses a player's status code for a single round and calculates their individual point value.
 * This function handles complex, hyphenated codes and various combinations.
 * @param code The player's status code (e.g., "1P-25", "MS", "3C2P-F").
 * @param rules The current game rules with point values.
 * @returns The calculated point value for that player's status code.
 */
export function parsePlayerStatus(code: string, rules: GameRules): number {
    const upperCode = code.toUpperCase().trim();
    if (!upperCode) return 0;
    
    // 'D' and 'G' are markers and don't have point values themselves.
    if (upperCode === "D" || upperCode === "G") return 0;

    let score = 0;
    const parts = upperCode.split('-');

    parts.forEach(part => {
        let currentPart = part;
        
        // Handle Paplu (these are negative/penalties for losers, but bonuses for winner)
        if (currentPart.includes("3P")) score += rules.triplePaplu;
        if (currentPart.includes("2P")) score += rules.doublePaplu;
        if (currentPart.includes("1P")) score += rules.singlePaplu;
        
        // Handle Statuses (S, MS, F)
        if (currentPart.includes("MS")) score += rules.midScoot;
        else if (currentPart.includes("S")) score += rules.scoot; // Use else-if to prevent double counting S in MS
        
        if (currentPart.includes("F")) score += rules.full;
        
        // Handle numeric values, removing status codes first
        const numericPart = currentPart.replace(/(3C|1P|2P|3P|MS|S|F|D|G)/g, '');
        const numericValue = parseInt(numericPart, 10);
        if (!isNaN(numericValue)) {
            score += numericValue * rules.perPoint;
        }
    });

    return score;
}

/**
 * Calculates the scores for all players for a single round based on their status codes.
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
    const basePoints: Record<string, number> = {};
    players.forEach(p => scores[p.id] = 0);
    
    // 1. Calculate base points for everyone
    players.forEach(player => {
        const status = playerStatus[player.id] || "";
        basePoints[player.id] = parsePlayerStatus(status, rules);
    });

    // 2. Apply Gate (G) rule if present
    const gatePlayer = players.find(p => (playerStatus[p.id] || "").toUpperCase().includes("G"));
    if (gatePlayer) {
        players.forEach(otherPlayer => {
            if (otherPlayer.id !== gatePlayer.id) {
                const otherPlayerStatus = (playerStatus[otherPlayer.id] || "").toUpperCase();
                if (!otherPlayerStatus.includes("S")) {
                    basePoints[otherPlayer.id] *= 2;
                }
            }
        });
    }

    // --- 3. Winner Logic ---
    // The winner is the one with "D" (Declare)
    const winners = players.filter(p => (playerStatus[p.id] || "").toUpperCase().includes("D"));

    // If there is exactly one winner (one "D")
    if (winners.length === 1) {
        const winnerId = winners[0].id;
        let totalPointsForWinner = 0;
        
        // Handle special 3C transaction first if it exists
        if (is3CardGame) {
            const threeCardPlayer = players.find(p => (playerStatus[p.id] || "").toUpperCase().includes("3C"));
            if (threeCardPlayer) {
                players.forEach(p => {
                    if (p.id === threeCardPlayer.id) {
                        scores[p.id] += rules.attaKasu * (players.length - 1);
                    } else {
                        scores[p.id] -= rules.attaKasu;
                    }
                });
            }
        }


        // Calculate loser scores and sum them up for the winner
        players.forEach(player => {
            if (player.id !== winnerId) {
                const loserPoints = basePoints[player.id];
                // Loser's score is their points, made negative. Their base score already includes deductions.
                scores[player.id] -= loserPoints;
                // Winner gets the loser's points
                totalPointsForWinner += loserPoints;
            }
        });

        // Winner also gets their own base points
        totalPointsForWinner += basePoints[winnerId];

        scores[winnerId] += totalPointsForWinner;
        
        return scores;
    }
    
    // --- Fallback/No-Winner Logic ---
    // This runs if there is no winner or multiple winners.
    // Each player's score is simply their own calculated points, made negative.
    players.forEach(player => {
        scores[player.id] = -basePoints[player.id];
    });

    return scores;
}
