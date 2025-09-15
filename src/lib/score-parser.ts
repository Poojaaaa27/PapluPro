
import type { Player, GameRules } from "./types";

/**
 * Parses a player's status code to extract distinct parts like paplu count, 
 * numeric value, and flags (S, MS, F, D, G, 3C).
 * @param code The player's status code (e.g., "1P-25", "MS", "3C2P-F-D").
 * @returns An object containing the parsed information.
 */
function getPlayerFlags(code: string) {
    const upperCode = code.toUpperCase().trim();
    const flags = {
        is3C: upperCode.includes("3C"),
        isWinner: upperCode.includes("D"),
        isGate: upperCode.includes("G"),
        isScoot: upperCode.includes("S"),
        isMidScoot: upperCode.includes("MS"),
        isFull: upperCode.includes("F"),
        papluCount: 0,
        points: 0,
    };

    if (upperCode.includes("1P")) flags.papluCount = 1;
    if (upperCode.includes("2P")) flags.papluCount = 2;
    if (upperCode.includes("3P")) flags.papluCount = 3;

    // Extracts numeric value, including negative numbers
    const numericMatch = upperCode.match(/-?\d+/);
    if (numericMatch) {
        flags.points = parseInt(numericMatch[0], 10);
    }

    return flags;
}


/**
 * Calculates the scores for all players for a single round based on their status codes
 * following a transactional logic.
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
    players.forEach(p => scores[p.id] = 0);

    const numPlayers = players.length;
    if (numPlayers < 2) return scores;

    // === Pre-calculation Step: Get all player flags ===
    const allPlayerFlags: Record<string, ReturnType<typeof getPlayerFlags>> = {};
    players.forEach(p => {
        allPlayerFlags[p.id] = getPlayerFlags(playerStatus[p.id] || "");
    });
    
    // === Transaction 1: 3 Cards (attaKasu) ===
    const threeCardPlayerId = players.find(p => allPlayerFlags[p.id].is3C)?.id;
    if (threeCardPlayerId) {
        players.forEach(p => {
            if (p.id === threeCardPlayerId) {
                scores[p.id] += rules.attaKasu * (numPlayers - 1);
            } else {
                scores[p.id] -= rules.attaKasu;
            }
        });
    }

    // === Transaction 2: Paplus ===
    players.forEach(p => {
        const flags = allPlayerFlags[p.id];
        let papluAmount = 0;
        if (flags.papluCount === 1) papluAmount = rules.singlePaplu;
        if (flags.papluCount === 2) papluAmount = rules.doublePaplu;
        if (flags.papluCount === 3) papluAmount = rules.triplePaplu;

        if (papluAmount > 0) {
            players.forEach(otherPlayer => {
                if (p.id === otherPlayer.id) {
                    scores[p.id] += papluAmount * (numPlayers - 1);
                } else {
                    scores[otherPlayer.id] -= papluAmount;
                }
            });
        }
    });

    // === Transaction 3: Round Winner Payout ===
    const winnerId = players.find(p => allPlayerFlags[p.id].isWinner)?.id;
    if (winnerId) {
        const winnerIsGate = allPlayerFlags[winnerId].isGate;
        let totalPot = 0;

        players.forEach(loser => {
            if (loser.id === winnerId) return;

            const loserFlags = allPlayerFlags[loser.id];
            let amountOwed = 0;

            if (loserFlags.isScoot) {
                amountOwed = rules.scoot;
            } else if (loserFlags.isMidScoot) {
                amountOwed = rules.midScoot;
            } else if (loserFlags.isFull) {
                amountOwed = rules.full;
            } else {
                // Normal points - points are what the loser PAYS, so we use their absolute value.
                amountOwed = Math.abs(loserFlags.points);
            }

            // Apply Gate/Double from winner, cannot apply to S or MS
            if (winnerIsGate && !loserFlags.isScoot && !loserFlags.isMidScoot) {
                amountOwed *= 2;
            }
            
            scores[loser.id] -= amountOwed;
            totalPot += amountOwed;
        });

        scores[winnerId] += totalPot;
    }

    return scores;
}
