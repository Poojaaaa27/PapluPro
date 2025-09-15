
import type { Player, GameRules } from "./types";

/**
 * Parses a player's status code to extract distinct parts like paplu count, 
 * numeric value, and flags (3C, S, MS, F, D, G).
 * @param code The player's status code (e.g., "1P-25", "MS", "3C1P-D").
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
 * Calculates the scores for all players for a single round based on their status codes.
 * This version uses a multi-step transactional model.
 * @param playerStatus A record of player IDs to their status codes for the round.
 * @param players An array of all players in the game.
 * @param rules The current game rules.
 * @param is3CardGame A boolean indicating if the 3-card winner rule is active.
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
    
    if (players.length < 2) return scores;

    const allPlayerFlags = players.map(p => ({
        playerId: p.id,
        flags: parsePlayerStatus(playerStatus[p.id] || "")
    }));

    // Transaction 1: 3C (attaKasu) payout
    if (is3CardGame) {
        const threeCardPlayer = allPlayerFlags.find(p => p.flags.is3C);
        if (threeCardPlayer) {
            const threeCardWinnings = rules.attaKasu * (players.length - 1);
            scores[threeCardPlayer.playerId] += threeCardWinnings;
            players.forEach(p => {
                if (p.id !== threeCardPlayer.playerId) {
                    scores[p.id] -= rules.attaKasu;
                }
            });
        }
    }

    // Transaction 2: Paplu Payouts
    allPlayerFlags.forEach(playerData => {
        let papluPayment = 0;
        if (playerData.flags.papluCount === 1) papluPayment = rules.singlePaplu;
        if (playerData.flags.papluCount === 2) papluPayment = rules.doublePaplu;
        if (playerData.flags.papluCount === 3) papluPayment = rules.triplePaplu;

        if (papluPayment > 0) {
            const papluWinnings = papluPayment * (players.length - 1);
            scores[playerData.playerId] += papluWinnings;
            players.forEach(p => {
                if (p.id !== playerData.playerId) {
                    scores[p.id] -= papluPayment;
                }
            });
        }
    });

    // Transaction 3: Main Round Winner Payout
    const winnerData = allPlayerFlags.find(p => p.flags.isWinner);
    if (winnerData) {
        let winnerPot = 0;
        const winnerId = winnerData.playerId;

        allPlayerFlags.forEach(playerData => {
            if (playerData.playerId === winnerId) return; // Skip the winner

            const loserId = playerData.playerId;
            const loserFlags = playerData.flags;
            let amountOwed = 0;

            if (loserFlags.isScoot) {
                amountOwed = rules.scoot;
            } else if (loserFlags.isMidScoot) {
                amountOwed = rules.midScoot;
            } else if (loserFlags.isFull) {
                amountOwed = rules.full;
            } else {
                // Normal points calculation
                amountOwed = Math.abs(loserFlags.points) * rules.perPoint;
            }

            // Gate rule: double the amount if winner has G, except for S/MS
            if (winnerData.flags.isGate && !loserFlags.isScoot && !loserFlags.isMidScoot) {
                amountOwed *= 2;
            }

            scores[loserId] -= amountOwed;
            winnerPot += amountOwed;
        });

        scores[winnerId] += winnerPot;
    }
    
    return scores;
}
