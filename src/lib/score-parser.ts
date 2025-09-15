
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
 * following a multi-step transactional logic.
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
    const numPlayers = players.length;
    if (numPlayers < 2) return scores;

    const allPlayerFlags = players.map(p => ({
        playerId: p.id,
        flags: parsePlayerStatus(playerStatus[p.id] || "")
    }));
    
    // Transaction 1: 3-Card Winner Payout (if applicable)
    if (is3CardGame) {
        const threeCardWinner = allPlayerFlags.find(p => p.flags.is3C);
        if (threeCardWinner) {
            const amount = rules.attaKasu;
            scores[threeCardWinner.playerId] += amount * (numPlayers - 1);
            players.forEach(p => {
                if (p.id !== threeCardWinner.playerId) {
                    scores[p.id] -= amount;
                }
            });
        }
    }

    // Transaction 2: Paplu Payouts (separate exchanges)
    allPlayerFlags.forEach(playerWithFlags => {
        let papluAmount = 0;
        if (playerWithFlags.flags.papluCount === 1) papluAmount = rules.singlePaplu;
        if (playerWithFlags.flags.papluCount === 2) papluAmount = rules.doublePaplu;
        if (playerWithFlags.flags.papluCount === 3) papluAmount = rules.triplePaplu;

        if (papluAmount > 0) {
            scores[playerWithFlags.playerId] += papluAmount * (numPlayers - 1);
            players.forEach(p => {
                if (p.id !== playerWithFlags.playerId) {
                    scores[p.id] -= papluAmount;
                }
            });
        }
    });

    // Transaction 3: Round Winner takes the pot
    const winnerData = allPlayerFlags.find(p => p.flags.isWinner);
    if (winnerData) {
        const winnerId = winnerData.playerId;
        const winnerFlags = winnerData.flags;
        let pot = 0;

        allPlayerFlags.forEach(playerData => {
            if (playerData.playerId === winnerId) return; // Skip the winner

            const loserFlags = playerData.flags;
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
            
            // Apply Gate from winner (doubling), except for scoot/mid-scoot
            if (winnerFlags.isGate && !loserFlags.isScoot && !loserFlags.isMidScoot) {
                amountOwed *= 2;
            }
            
            scores[playerData.playerId] -= amountOwed;
            pot += amountOwed;
        });

        scores[winnerId] += pot;
    }
    
    return scores;
}
