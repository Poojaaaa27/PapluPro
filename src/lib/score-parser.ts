
import type { Player, GameRules } from "./types";

/**
 * Parses a player's status code to extract distinct parts.
 * It separates global transaction flags (3C, Paplu) from winner-pot flags (S, MS, F, points).
 * The hyphen '-' is the key separator.
 * @param code The player's status code (e.g., "1P-25", "MS", "3C-D").
 * @returns An object containing the parsed information.
 */
function parsePlayerStatus(code: string) {
    const upperCode = code.toUpperCase().trim();
    
    // Default structure
    const result = {
        isWinner: upperCode.includes("D"),
        isGate: upperCode.includes("G"),
        // Global transactions (typically before '-')
        is3C: false,
        papluCount: 0,
        // Winner pot transactions (typically after '-')
        isScoot: false,
        isMidScoot: false,
        isFull: false,
        points: 0,
    };

    // Use a regex to find parts before and after the first hyphen
    const parts = upperCode.split('-');
    const preHyphenPart = parts[0] || '';
    const postHyphenPart = parts.length > 1 ? parts.slice(1).join('-') : preHyphenPart;
    const hasHyphen = parts.length > 1;

    // --- Process Pre-Hyphen Part (or the whole string if no hyphen) for global flags ---
    const partForGlobals = hasHyphen ? preHyphenPart : upperCode;

    if (partForGlobals.includes("3C")) result.is3C = true;
    if (partForGlobals.includes("1P")) result.papluCount = 1;
    if (partForGlobals.includes("2P")) result.papluCount = 2;
    if (partForGlobals.includes("3P")) result.papluCount = 3;


    // --- Process Post-Hyphen Part (or the whole string if no hyphen) for winner pot ---
    const partForPot = hasHyphen ? postHyphenPart : upperCode;

    if (partForPot.includes("S")) result.isScoot = true;
    if (partForPot.includes("MS")) result.isMidScoot = true;
    if (partForPot.includes("F")) result.isFull = true;
    
    // Extracts numeric value, but not from paplu codes
    const numericMatch = partForPot.replace(/\d+P/g, '').match(/-?\d+/);
    if (numericMatch) {
        result.points = parseInt(numericMatch[0], 10);
    }

    return result;
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

    // Transaction 1: 3C (attaKasu) Payout - Global
    if (is3CardGame) {
        const threeCardPlayer = allPlayerFlags.find(p => p.flags.is3C);
        if (threeCardPlayer) {
            const winnings = rules.attaKasu * (players.length - 1);
            scores[threeCardPlayer.playerId] += winnings;
            players.forEach(p => {
                if (p.id !== threeCardPlayer.playerId) {
                    scores[p.id] -= rules.attaKasu;
                }
            });
        }
    }

    // Transaction 2: Paplu Payouts - Global
    allPlayerFlags.forEach(playerData => {
        let papluPayment = 0;
        if (playerData.flags.papluCount === 1) papluPayment = rules.singlePaplu;
        if (playerData.flags.papluCount === 2) papluPayment = rules.doublePaplu;
        if (playerData.flags.papluCount === 3) papluPayment = rules.triplePaplu;

        if (papluPayment > 0) {
            const winnings = papluPayment * (players.length - 1);
            scores[playerData.playerId] += winnings;
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
