
import type { Player, GameRules } from "./types";

interface ParsedStatus {
    isWinner: boolean;
    isScoot: boolean;
    isMidScoot: boolean;
    isFull: boolean;
    isGate: boolean;
    is3C: boolean;
    papluCount: 0 | 1 | 2 | 3;
    points: number;
}

/**
 * Parses the raw input string for a player into a structured status object.
 * @param rawInput The raw string code (e.g., "1P-25", "3CG-D", "3C1P-D", "MS").
 * @returns A ParsedStatus object.
 */
function parsePlayerStatus(rawInput: string): ParsedStatus {
    const status: ParsedStatus = {
        isWinner: false,
        isScoot: false,
        isMidScoot: false,
        isFull: false,
        isGate: false,
        is3C: false,
        papluCount: 0,
        points: 0
    };
    
    if (!rawInput) return status;

    const upperInput = rawInput.toUpperCase();
    
    const parts = upperInput.split('-');
    const preDashPart = parts[0] || "";
    
    // Check for flags in the entire string, as they can be anywhere.
    if (upperInput.includes("3C")) status.is3C = true;
    if (upperInput.includes("3P")) status.papluCount = 3;
    else if (upperInput.includes("2P")) status.papluCount = 2;
    else if (upperInput.includes("1P")) status.papluCount = 1;

    if (upperInput.includes("MS")) status.isMidScoot = true;
    
    // Winner-specific flags
    if (upperInput.includes("D")) status.isWinner = true;
    if (upperInput.includes("G")) status.isGate = true;
    
    // Use pre-dash part for scoot/full determination if they are not with points.
    if (preDashPart === "S") status.isScoot = true;
    if (preDashPart === "F") status.isFull = true;

    // Extract numeric points, which can be positive or negative
    const pointMatch = upperInput.match(/-?\d+/);
    if (pointMatch) {
        status.points = parseInt(pointMatch[0], 10);
    }
    
    return status;
}


/**
 * Calculates scores for a round based on raw input strings.
 * This is a complete rewrite to fix previous logical errors.
 * @param playerStatus Record of player ID to their raw input string.
 * @param players Array of all players.
 * @param rules The game rules.
 * @param is3CardGame Whether the 3-card winner rule is active.
 * @returns A record of player IDs to their calculated scores.
 */
export function calculateRoundScores(
    playerStatus: Record<string, string>,
    players: Player[],
    rules: GameRules,
    is3CardGame: boolean
): Record<string, number> {
    const finalScores: Record<string, number> = {};
    players.forEach(p => finalScores[p.id] = 0);

    if (players.length < 2) return finalScores;

    const allPlayerFlags = players.map(p => ({
        playerId: p.id,
        flags: parsePlayerStatus(playerStatus[p.id] || "")
    }));

    // --- Stage 1: Bonus Transactions (3C and Paplu) ---
    // These are independent transactions between a holder and all other players.
    
    // 1.1: 3C Payout
    if (is3CardGame) {
        const threeCardPlayers = allPlayerFlags.filter(p => p.flags.is3C);
        threeCardPlayers.forEach(threeCardPlayer => {
            allPlayerFlags.forEach(otherPlayer => {
                if (otherPlayer.playerId !== threeCardPlayer.playerId) {
                    finalScores[threeCardPlayer.playerId] += rules.basePoints;
                    finalScores[otherPlayer.playerId] -= rules.basePoints;
                }
            });
        });
    }

    // 1.2: Paplu Payouts
    allPlayerFlags.forEach(playerData => {
        let papluPayment = 0;
        if (playerData.flags.papluCount === 1) papluPayment = rules.singlePaplu;
        else if (playerData.flags.papluCount === 2) papluPayment = rules.doublePaplu;
        else if (playerData.flags.papluCount === 3) papluPayment = rules.triplePaplu;

        if (papluPayment > 0) {
            allPlayerFlags.forEach(otherPlayer => {
                if (otherPlayer.playerId !== playerData.playerId) {
                    finalScores[playerData.playerId] += papluPayment;
                    finalScores[otherPlayer.playerId] -= papluPayment;
                }
            });
        }
    });

    // --- Stage 2: Main Round Winner Payout ---
    // The winner collects from all losing players. This happens after bonuses.

    const winnerData = allPlayerFlags.find(p => p.flags.isWinner);
    if (winnerData) {
        const winnerId = winnerData.playerId;

        allPlayerFlags.forEach(loserData => {
            // A player doesn't pay themselves.
            if (loserData.playerId === winnerId) return;

            const loserId = loserData.playerId;
            const loserFlags = loserData.flags;
            let amountOwed = 0;

            if (loserFlags.isScoot) {
                amountOwed = rules.scoot;
            } else if (loserFlags.isMidScoot) {
                amountOwed = rules.midScoot;
            } else if (loserFlags.isFull) {
                amountOwed = rules.full;
            } else {
                // For regular players, points are based on their hand value.
                amountOwed = Math.abs(loserFlags.points) * rules.perPoint;
            }

            // The "Gate" rule for the winner doubles the amount owed by non-scoot/mid-scoot players.
            if (winnerData.flags.isGate && !loserFlags.isScoot && !loserFlags.isMidScoot) {
                amountOwed *= 2;
            }
            
            // The loser pays the winner. This is added to the existing scores.
            finalScores[loserId] -= amountOwed;
            finalScores[winnerId] += amountOwed;
        });
    }

    return finalScores;
}
