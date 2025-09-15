
import type { Player, GameRules, PlayerRoundStatus } from "./types";

/**
 * Calculates the scores for all players for a single round based on their structured status.
 * This version uses a multi-step transactional model.
 * @param playerStatus A record of player IDs to their structured status for the round.
 * @param players An array of all players in the game.
 * @param rules The current game rules.
 * @param is3CardGame A boolean indicating if the 3-card winner rule is active.
 * @returns A record of player IDs to their calculated scores for the round.
 */
export function calculateRoundScores(
    playerStatus: Record<string, PlayerRoundStatus>,
    players: Player[],
    rules: GameRules,
    is3CardGame: boolean
): Record<string, number> {
    const scores: Record<string, number> = {};
    players.forEach(p => scores[p.id] = 0);
    
    if (players.length < 2) return scores;

    const allPlayerFlags = players.map(p => ({
        playerId: p.id,
        flags: playerStatus[p.id] || { points: 0, isWinner: false, isScoot: false, isMidScoot: false, isFull: false, isGate: false, is3C: false, papluCount: 0, rawInput: "" }
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
