
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
        const papluMatch = part.match(/(\d+)P/);
        const statusMatch = part.match(/MS|S|F/);
        const numericMatch = part.match(/^\d+$/);

        if (statusMatch) {
            const status = statusMatch[0];
            if (status === "S") score += rules.scoot;
            else if (status === "MS") score += rules.midScoot;
            else if (status === "F") score += rules.full;
        }

        if (papluMatch) {
            const papluCount = parseInt(papluMatch[1], 10);
            if (papluCount === 1) score += rules.singlePaplu;
            else if (papluCount === 2) score += rules.doublePaplu;
            else if (papluCount === 3) score += rules.triplePaplu;
        }
        
        if (numericMatch && !papluMatch && !statusMatch) {
             score += parseInt(numericMatch[0], 10) * rules.perPoint;
        }
    });

    // Handle case where numeric points are appended, e.g. 1P-25
    const lastPart = parts[parts.length - 1];
    const numericSuffixMatch = lastPart.match(/^\d+$/);
    if (parts.length > 1 && numericSuffixMatch) {
        // Only add if it wasn't the primary parsed value of a single-part numeric string
        if (parts.length > 1) {
            score += parseInt(numericSuffixMatch[0], 10) * rules.perPoint;
        }
    }


    return score;
}

/**
 * Calculates the scores for all players for a single round based on their status codes.
 * This function enforces the rule that there must be exactly one winner (3C) if it's a 3-card game.
 * It also handles the "G" (Gate) rule.
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

    // 2. Apply Gate (G) rule
    const gatePlayers = players.filter(p => (playerStatus[p.id] || "").toUpperCase().includes("G"));
    if (gatePlayers.length > 0) {
        // Make a mutable copy of basePoints to apply gate effect
        const modifiedBasePoints = { ...basePoints };
        gatePlayers.forEach(gatePlayer => {
            players.forEach(otherPlayer => {
                if (otherPlayer.id !== gatePlayer.id) {
                    const otherPlayerStatus = (playerStatus[otherPlayer.id] || "").toUpperCase();
                    // Double points unless they have Scoot (S)
                    if (!otherPlayerStatus.includes("S")) {
                        // The doubling effect is cumulative if there are multiple gate players
                         modifiedBasePoints[otherPlayer.id] = basePoints[otherPlayer.id] * (2 * gatePlayers.length)
                    }
                }
            });
        });
        // Overwrite basePoints with the gate-modified points
         Object.assign(basePoints, modifiedBasePoints);
    }
    
    const winners = players.filter(p => (playerStatus[p.id] || "").toUpperCase().includes("3C"));

    // --- 3 Card Game Logic with a single winner ---
    if (is3CardGame && winners.length === 1) {
        const winnerId = winners[0].id;
        let totalPointsForWinner = 0;

        // Calculate loser scores and sum them up for the winner
        players.forEach(player => {
            if (player.id !== winnerId) {
                const loserPoints = basePoints[player.id];
                // Loser's score is their points + attaKasu, made negative
                scores[player.id] = -(loserPoints + rules.attaKasu);
                // Winner gets the loser's points + attaKasu
                totalPointsForWinner += loserPoints + rules.attaKasu;
            }
        });

        // Winner also gets their own base points
        totalPointsForWinner += basePoints[winnerId];

        scores[winnerId] = totalPointsForWinner;
        
        return scores;
    }
    
    // --- Fallback/No-Winner Logic ---
    // This runs if it's not a 3-card game, or if there isn't exactly one winner.
    // Each player's score is simply their own calculated points, made negative.
    // This handles cases like "MS", "MS", "MS".
    players.forEach(player => {
        // If a player has "3C" in an invalid round, they get 0.
        if ((playerStatus[player.id] || "").toUpperCase().includes("3C")) {
            scores[player.id] = 0;
        } else {
            scores[player.id] = -basePoints[player.id];
        }
    });

    return scores;
}
