
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
    
    // 'D' and 'G' are markers and don't have point values themselves.
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
        // Note: Paplu points are added here but typically result in a negative score for losers.
        // The calling function `calculateRoundScores` will handle making the final score negative.
        if (papluCount === 1) score += rules.singlePaplu;
        else if (papluCount === 2) score += rules.doublePaplu;
        else if (papluCount === 3) score += rules.triplePaplu;
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
    players.forEach(p => scores[p.id] = 0);
    
    const winners = players.filter(p => (playerStatus[p.id] || "").toUpperCase().includes("3C"));
    const gatePlayers = players.filter(p => (playerStatus[p.id] || "").toUpperCase().includes("G"));

    // --- 3 Card Game Logic ---
    if (is3CardGame && winners.length === 1) {
        const winnerId = winners[0].id;
        let totalLoserPoints = 0;

        // Calculate initial points for all losers
        const loserScores: Record<string, number> = {};
        players.forEach(player => {
            if (player.id !== winnerId) {
                const status = playerStatus[player.id] || "";
                const points = parsePlayerStatus(status, rules);
                loserScores[player.id] = points;
            } else {
                 loserScores[player.id] = 0;
            }
        });

        // Apply Gate rule
        if (gatePlayers.length > 0) {
            gatePlayers.forEach(gatePlayer => {
                players.forEach(otherPlayer => {
                    // Gate doubles other players' points, except for scoot players
                    const otherPlayerStatus = (playerStatus[otherPlayer.id] || "").toUpperCase();
                    if (otherPlayer.id !== gatePlayer.id && !otherPlayerStatus.includes("S")) {
                        // If the other player is the winner, this logic doesn't apply.
                        // We only double loser's points.
                        if (otherPlayer.id !== winnerId) {
                           loserScores[otherPlayer.id] *= 2;
                        }
                    }
                });
            });
        }
        
        // Sum up final loser points and assign negative scores
        players.forEach(player => {
            if (player.id !== winnerId) {
                scores[player.id] = -loserScores[player.id];
                totalLoserPoints += loserScores[player.id];
            }
        });


        // Add Atta Kasu for each loser
        const loserCount = players.length - 1;
        totalLoserPoints += loserCount * rules.attaKasu;

        // The winner also gets points for their own status (e.g., paplus)
        const winnerStatus = playerStatus[winnerId] || "";
        const winnerBonusPoints = parsePlayerStatus(winnerStatus, rules);
        totalLoserPoints += winnerBonusPoints;

        // Assign final score to winner
        scores[winnerId] = totalLoserPoints;

        return scores;
    }
    
    // --- Default Scoring Logic (No single winner in a 3-card game, or not a 3-card game) ---
    // Score everyone individually.
    const individualScores: Record<string, number> = {};
    players.forEach(player => {
        const status = (playerStatus[player.id] || "").trim().toUpperCase();
        if (status) {
            // A player with 3C in a non-winning round gets 0
            if (status.includes("3C")) {
                 individualScores[player.id] = 0;
            } else {
                 individualScores[player.id] = parsePlayerStatus(status, rules);
            }
        } else {
            individualScores[player.id] = 0;
        }
    });

    // Apply Gate rule for non-winner scenarios
    if (gatePlayers.length > 0) {
        gatePlayers.forEach(gatePlayer => {
            players.forEach(otherPlayer => {
                const otherPlayerStatus = (playerStatus[otherPlayer.id] || "").toUpperCase();
                if(otherPlayer.id !== gatePlayer.id && !otherPlayerStatus.includes("S")) {
                    individualScores[otherPlayer.id] *= 2;
                }
            });
        });
    }
    
    // Assign final negative scores
    players.forEach(player => {
        scores[player.id] = -individualScores[player.id];
    });

    return scores;
}

