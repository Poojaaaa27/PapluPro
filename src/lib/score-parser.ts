
import type { Player, GameRules } from "./types";

/**
 * Parses a player's status code to extract distinct parts like paplu count, 
 * numeric value, and flags (S, MS, F, D, G, 3C).
 * @param code The player's status code (e.g., "1P-25", "MS", "3C2P-F-D").
 * @returns An object containing the parsed information.
 */
function parsePlayerStatus(code: string) {
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

    // Extracts numeric value, including negative numbers, but not from paplu codes
    const numericMatch = upperCode.replace(/\d+P/g, '').match(/-?\d+/);
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

    const allPlayerFlags: Record<string, ReturnType<typeof parsePlayerStatus>> = {};
    let winnerId: string | null = null;
    let threeCardPlayerId: string | null = null;
    
    players.forEach(p => {
        const flags = parsePlayerStatus(playerStatus[p.id] || "");
        allPlayerFlags[p.id] = flags;
        if (flags.isWinner) winnerId = p.id;
        if (flags.is3C) threeCardPlayerId = p.id;
    });

    // === Transaction 1: 3-Card Winner ===
    if (threeCardPlayerId) {
        const amount = rules.attaKasu;
        scores[threeCardPlayerId] += amount * (numPlayers - 1);
        players.forEach(p => {
            if (p.id !== threeCardPlayerId) {
                scores[p.id] -= amount;
            }
        });
    }

    // === Transaction 2: Paplu Payments ===
    players.forEach(p => {
        const flags = allPlayerFlags[p.id];
        let papluAmount = 0;
        if (flags.papluCount === 1) papluAmount = rules.singlePaplu;
        if (flags.papluCount === 2) papluAmount = rules.doublePaplu;
        if (flags.papluCount === 3) papluAmount = rules.triplePaplu;

        if (papluAmount > 0) {
            scores[p.id] += papluAmount * (numPlayers - 1);
            players.forEach(otherPlayer => {
                if (otherPlayer.id !== p.id) {
                    scores[otherPlayer.id] -= papluAmount;
                }
            });
        }
    });

    // === Transaction 3: Round Winner Payments ===
    if (winnerId) {
        const winnerFlags = allPlayerFlags[winnerId];
        let pot = 0;

        players.forEach(p => {
            if (p.id === winnerId) return;

            const loserFlags = allPlayerFlags[p.id];
            let amountOwed = 0;

            if (loserFlags.isScoot) {
                amountOwed = rules.scoot;
            } else if (loserFlags.isMidScoot) {
                amountOwed = rules.midScoot;
            } else if (loserFlags.isFull) {
                amountOwed = rules.full;
            } else {
                amountOwed = Math.abs(loserFlags.points) * rules.perPoint;
            }

            // Apply Gate from winner
            if (winnerFlags.isGate && !loserFlags.isScoot && !loserFlags.isMidScoot) {
                amountOwed *= 2;
            }

            scores[p.id] -= amountOwed;
            pot += amountOwed;
        });

        scores[winnerId] += pot;
    } else {
      // No winner scenario: players pay for their own status if not already handled
      // This case might need more specific rules. For now, assuming D is mandatory for a pot.
    }

    return scores;
}
