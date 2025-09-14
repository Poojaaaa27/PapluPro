
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
    if (!upperCode || upperCode === "D" || upperCode === "G") return 0;
    
    let score = 0;
    
    // Split by hyphen to handle combined statuses like "1P-S"
    const parts = upperCode.split('-');

    parts.forEach(part => {
        let currentPart = part;

        // Add points for statuses
        if (currentPart.includes("MS")) score += rules.midScoot;
        else if (currentPart.includes("S")) score += rules.scoot;
        
        if (currentPart.includes("F")) score += rules.full;

        // Add points for Paplu
        if (currentPart.includes("3P")) score += rules.triplePaplu;
        if (currentPart.includes("2P")) score += rules.doublePaplu;
        if (currentPart.includes("1P")) score += rules.singlePaplu;

        // Handle numeric values, removing all alphabetic characters
        const numericPart = currentPart.replace(/[A-Z]/g, '');
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
 * @param is3CardGame A boolean indicating if it's a 3-card game. (Currently unused, but kept for future logic)
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
    
    // 1. Calculate base points for everyone from their codes
    players.forEach(player => {
        const status = playerStatus[player.id] || "";
        basePoints[player.id] = parsePlayerStatus(status, rules);
    });

    // 2. Handle 3C transaction (attaKasu) if applicable
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

    // 3. Identify Winner (with 'D') and calculate main pot
    const winner = players.find(p => (playerStatus[p.id] || "").toUpperCase().includes("D"));

    if (winner) {
        let totalPot = 0;
        // Winner collects points from losers
        players.forEach(player => {
            if (player.id !== winner.id) {
                const loserPoints = basePoints[player.id];
                scores[player.id] -= loserPoints;
                totalPot += loserPoints;
            }
        });
        // Winner also gets their own base points
        totalPot += basePoints[winner.id];
        scores[winner.id] += totalPot;
    } else {
        // No winner, everyone with points loses them
        players.forEach(player => {
            scores[player.id] -= basePoints[player.id];
        });
    }

    // 4. Apply Gate (G) rule at the end
    const gatePlayer = players.find(p => (playerStatus[p.id] || "").toUpperCase().trim() === "G");
    if (gatePlayer) {
        players.forEach(otherPlayer => {
            const otherPlayerStatus = (playerStatus[otherPlayer.id] || "").toUpperCase();
            // Don't double the gate player's score, and don't double players with Scoot ('S')
            if (otherPlayer.id !== gatePlayer.id && !otherPlayerStatus.includes("S")) {
                scores[otherPlayer.id] *= 2;
            }
        });
    }

    return scores;
}
