
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
        // Global transactions
        is3C: false,
        papluCount: 0,
        // Winner pot transactions
        isScoot: false,
        isMidScoot: false,
        isFull: false,
        points: 0,
    };

    // Use a regex to find parts before and after the first hyphen
    const parts = upperCode.split('-');
    const preHyphenPart = parts[0] || '';
    const postHyphenPart = parts.length > 1 ? parts.slice(1).join('-') : '';
    
    // --- Process Pre-Hyphen Part (and the whole string) for global flags ---
    const globalPart = preHyphenPart;
    if (globalPart.includes("3C")) result.is3C = true;
    if (globalPart.includes("1P")) result.papluCount = 1;
    if (globalPart.includes("2P")) result.papluCount = 2;
    if (globalPart.includes("3P")) result.papluCount = 3;


    // --- Process Post-Hyphen Part (or the whole string if no hyphen) for winner pot ---
    const potPart = postHyphenPart || preHyphenPart;

    if (potPart.includes("S")) result.isScoot = true;
    if (potPart.includes("MS")) result.isMidScoot = true;
    if (potPart.includes("F")) result.isFull = true;
    
    // Extracts numeric value, ensuring it's not part of a paplu code unless separated
    const numericMatch = potPart.replace(/\d+P/g, '').match(/-?\d+/);
    if (numericMatch) {
        result.points = parseInt(numericMatch[0], 10);
    }
    
    // Handle cases where there is no hyphen, so flags might be for the pot
    if (parts.length === 1) {
        if(preHyphenPart.includes("S")) result.isScoot = true;
        if(preHyphenPart.includes("MS")) result.isMidScoot = true;
        if(preHyphenPart.includes("F")) result.isFull = true;
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
            scores[threeCardPlayer.playerId] = (scores[threeCardPlayer.playerId] || 0) + winnings;
            players.forEach(p => {
                if (p.id !== threeCardPlayer.playerId) {
                    scores[p.id] = (scores[p.id] || 0) - rules.attaKasu;
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
            scores[playerData.playerId] = (scores[playerData.playerId] || 0) + winnings;
            players.forEach(p => {
                if (p.id !== playerData.playerId) {
                    scores[p.id] = (scores[p.id] || 0) - papluPayment;
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

            scores[loserId] = (scores[loserId] || 0) - amountOwed;
            winnerPot += amountOwed;
        });

        scores[winnerId] = (scores[winnerId] || 0) + winnerPot;
    }
    
    return scores;
}

