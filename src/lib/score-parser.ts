
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

    const winnerData = allPlayerFlags.find(p => p.flags.isWinner);
    
    // If there's no winner, the round is incomplete or scored differently.
    // For now, assume no points are exchanged if there is no "D".
    if (!winnerData) {
        return scores;
    }

    let winnerPot = 0;
    const winnerId = winnerData.playerId;

    allPlayerFlags.forEach(playerData => {
        if (playerData.playerId === winnerId) return; // Skip the winner

        const loserId = playerData.playerId;
        const loserFlags = playerData.flags;
        let amountOwed = 0;

        // Calculate amount owed based on loser's status
        if (loserFlags.isScoot) {
            amountOwed = rules.scoot;
        } else if (loserFlags.isMidScoot) {
            amountOwed = rules.midScoot;
        } else if (loserFlags.isFull) {
            amountOwed = rules.full;
        } else {
            amountOwed = Math.abs(loserFlags.points) * rules.perPoint;
        }

        // Add Paplu points to the amount owed
        if (loserFlags.papluCount === 1) amountOwed += rules.singlePaplu;
        if (loserFlags.papluCount === 2) amountOwed += rules.doublePaplu;
        if (loserFlags.papluCount === 3) amountOwed += rules.triplePaplu;

        // Add 3C points (attaKasu) if the loser has 3C
        if (is3CardGame && loserFlags.is3C) {
             amountOwed += rules.attaKasu;
        }

        // Apply Gate from winner (doubling), except for scoot/mid-scoot
        if (winnerData.flags.isGate && !loserFlags.isScoot && !loserFlags.isMidScoot) {
            
            // We need to separate the base points from the paplu/3c points if they are not doubled
            let baseAmount = 0;
             if (loserFlags.isFull) {
                baseAmount = rules.full;
            } else {
                baseAmount = Math.abs(loserFlags.points) * rules.perPoint;
            }

            let specialAmount = amountOwed - baseAmount;
            amountOwed = (baseAmount * 2) + specialAmount;
        }
        
        scores[loserId] -= amountOwed;
        winnerPot += amountOwed;
    });

    // Handle 3C transaction separately if the WINNER has 3C
    if(is3CardGame && winnerData.flags.is3C) {
        const threeCardWinnings = rules.attaKasu * (players.length -1);
        winnerPot += threeCardWinnings;
    }


    scores[winnerId] += winnerPot;
    
    return scores;
}
