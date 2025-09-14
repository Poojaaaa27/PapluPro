
import type { Player, GameRules } from "./types";

/**
 * Parses a player's status code for a single round and calculates their individual hand value.
 * This function handles complex, hyphenated codes and various combinations.
 * @param code The player's status code (e.g., "1P-25", "MS", "3C2P-F").
 * @param rules The current game rules with point values.
 * @returns The calculated point value for that player's hand.
 */
export function parsePlayerStatus(code: string, rules: GameRules): number {
    const upperCode = code.toUpperCase().trim();
    if (!upperCode) return 0;

    let score = 0;
    const parts = upperCode.split('-');

    parts.forEach(part => {
        let currentPart = part;

        // Handle Paplu first
        if (currentPart.includes("3P")) score += rules.triplePaplu;
        if (currentPart.includes("2P")) score += rules.doublePaplu;
        if (currentPart.includes("1P")) score += rules.singlePaplu;

        // Handle Statuses
        if (currentPart.includes("MS")) score += rules.midScoot;
        else if (currentPart.includes("S")) score += rules.scoot;
        
        if (currentPart.includes("F")) score += rules.full;

        // Handle numeric values, removing all alphabetic characters that are not part of a known code.
        // This regex removes 3C, 2P, 1P, MS, S, F, D, G before parsing the number.
        const numericPart = currentPart.replace(/3C|2P|1P|MS|S|F|D|G/g, '');
        const numericValue = parseInt(numericPart, 10);

        if (!isNaN(numericValue)) {
            score += numericValue;
        }
    });

    return score;
}

/**
 * Calculates the scores for all players for a single round based on their status codes.
 * This function now follows a strict order of operations to ensure accuracy.
 * @param playerStatus A record of player IDs to their status codes for the round.
 * @param players An array of all players in the game.
 * @param rules The current game rules.
 * @returns A record of player IDs to their calculated scores for the round.
 */
export function calculateRoundScores(
    playerStatus: Record<string, string>,
    players: Player[],
    rules: GameRules,
): Record<string, number> {

    const scores: Record<string, number> = {};
    const basePoints: Record<string, number> = {};
    const upperPlayerStatus: Record<string, string> = {};

    players.forEach(p => {
        scores[p.id] = 0;
        const status = playerStatus[p.id] || "";
        upperPlayerStatus[p.id] = status.toUpperCase().trim();
        basePoints[p.id] = parsePlayerStatus(status, rules);
    });

    // Step 1: Handle 3C transaction (attaKasu) if applicable
    const threeCardPlayerId = players.find(p => upperPlayerStatus[p.id].includes("3C"))?.id;
    if (threeCardPlayerId) {
        players.forEach(p => {
            if (p.id === threeCardPlayerId) {
                scores[p.id] += rules.attaKasu * (players.length - 1);
            } else {
                scores[p.id] -= rules.attaKasu;
            }
        });
    }

    // Step 2: Add base points to the current scores
    players.forEach(p => {
        scores[p.id] += basePoints[p.id];
    });

    // Step 3: Handle Winner (D) logic
    const winnerId = players.find(p => upperPlayerStatus[p.id].includes("D"))?.id;
    
    if (winnerId) {
        let totalPot = 0;
        players.forEach(p => {
            if (p.id !== winnerId) {
                totalPot += scores[p.id]; // Collect points from losers
            }
        });
        
        // Winner gets their own points plus the pot
        scores[winnerId] += totalPot; 

        // Losers lose their points
        players.forEach(p => {
            if (p.id !== winnerId) {
                scores[p.id] *= -1;
            }
        });

    } else {
        // No winner, everyone loses their points
        players.forEach(p => {
            scores[p.id] *= -1;
        });
    }

    // Step 4: Apply Gate (G) rule at the end
    const gatePlayerId = players.find(p => upperPlayerStatus[p.id] === "G")?.id;
    if (gatePlayerId) {
        players.forEach(p => {
            // Don't double the gate player's score, and don't double players with Scoot ('S')
            if (p.id !== gatePlayerId && !upperPlayerStatus[p.id].includes("S")) {
                scores[p.id] *= 2;
            }
        });
    }

    return scores;
}
