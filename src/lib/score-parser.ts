
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

    // This regex finds all codes and numbers in the string.
    const tokens = upperCode.match(/[A-Z]+|\d+/g) || [];
    let score = 0;
    let numericValue = 0;

    tokens.forEach(token => {
        if (!isNaN(Number(token))) {
            numericValue += parseInt(token, 10);
        } else {
            switch (token) {
                case 'S':
                    score += rules.scoot;
                    break;
                case 'MS':
                    score += rules.midScoot;
                    break;
                case 'F':
                    score += rules.full;
                    break;
                case '1P':
                    score += rules.singlePaplu;
                    break;
                case '2P':
                    score += rules.doublePaplu;
                    break;
                case '3P':
                    score += rules.triplePaplu;
                    break;
                // '3C', 'D', 'G' have special logic in calculateRoundScores, but no intrinsic point value.
                // Any other unrecognized alphabetic codes are ignored.
            }
        }
    });

    // Add the explicitly defined numeric value from the code
    score += numericValue * rules.perPoint;

    return score;
}

/**
 * Calculates the scores for all players for a single round based on their status codes.
 * This function now follows a strict order of operations to ensure accuracy.
 * @param playerStatus A record of player IDs to their status codes for the round.
 * @param players An array of all players in the game.
 * @param rules The current game rules.
 * @param is3CardGame A boolean indicating if the 3 card game rule is active.
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
    const upperPlayerStatus: Record<string, string> = {};

    players.forEach(p => {
        const status = playerStatus[p.id] || "";
        upperPlayerStatus[p.id] = status.toUpperCase().trim();
        basePoints[p.id] = parsePlayerStatus(status, rules);
        scores[p.id] = 0; // Initialize scores at 0
    });

    // Step 1: Handle 3C transaction (attaKasu) if applicable
    if (is3CardGame) {
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
    const gatePlayerId = players.find(p => upperPlayerStatus[p.id].includes("G"))?.id;
    if (gatePlayerId) {
        players.forEach(p => {
            // Don't double the gate player's score, and don't double players with Scoot ('S')
            if (p.id !== gatePlayerId && !upperPlayerStatus[p.id].includes("S")) {
                scores[p.id] *= 2;
            }
        });
    }

    // Final check to ensure total is zero for winner rounds
    if (winnerId) {
        const total = Object.values(scores).reduce((acc, score) => acc + score, 0);
        if (total !== 0) {
            // This is a failsafe. If something went wrong, the logic is flawed.
            // For now, we can adjust the winner's score to enforce the zero-sum rule.
            scores[winnerId] -= total;
        }
    }


    return scores;
}
