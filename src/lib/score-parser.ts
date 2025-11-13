
import type { Player, GameRules, PlayerStatus } from "./types";

/**
 * Calculates scores for a round based on structured PlayerStatus objects.
 * @param playerStatusRecord Record of player ID to their PlayerStatus object.
 * @param players Array of all players.
 * @param rules The game rules.
 * @param is3CardGame Whether the 3-card winner rule is active.
 * @param isSpecial Whether this is a special "wash" round.
 * @returns A record of player IDs to their calculated scores.
 */
export function calculateRoundScores(
    playerStatusRecord: Record<string, PlayerStatus>,
    players: Player[],
    rules: GameRules,
    is3CardGame: boolean,
    isSpecial: boolean = false
): Record<string, number> {
    const finalScores: Record<string, number> = {};
    players.forEach(p => finalScores[p.id] = 0);

    if (players.length < 2) return finalScores;

    const allPlayerStatuses = players.map(p => ({
        playerId: p.id,
        status: playerStatusRecord[p.id]
    }));

    // --- Stage 1: 3C and Paplu bonuses (Inter-player transactions) ---
    // These happen even in a special round.
    if (is3CardGame) {
        const threeCardPlayers = allPlayerStatuses.filter(p => p.status.is3C);
        threeCardPlayers.forEach(threeCardPlayer => {
            allPlayerStatuses.forEach(otherPlayer => {
                if (otherPlayer.playerId !== threeCardPlayer.playerId) {
                    finalScores[threeCardPlayer.playerId] += rules.threeCardHand;
                    finalScores[otherPlayer.playerId] -= rules.threeCardHand;
                }
            });
        });
    }
    
    // In a special round, we stop here.
    if (isSpecial) {
        // We need to return only the 3C scores. We reset all scores to 0 and re-apply 3C.
        const specialScores: Record<string, number> = {};
        players.forEach(p => specialScores[p.id] = 0);
        if (is3CardGame) {
            const threeCardPlayers = allPlayerStatuses.filter(p => p.status.is3C);
            threeCardPlayers.forEach(threeCardPlayer => {
                allPlayerStatuses.forEach(otherPlayer => {
                    if (otherPlayer.playerId !== threeCardPlayer.playerId) {
                        specialScores[threeCardPlayer.playerId] += rules.threeCardHand;
                        specialScores[otherPlayer.playerId] -= rules.threeCardHand;
                    }
                });
            });
        }
        return specialScores;
    }

    allPlayerStatuses.forEach(playerData => {
        let papluPayment = 0;
        if (playerData.status.papluCount === 1) papluPayment = rules.singlePaplu;
        else if (playerData.status.papluCount === 2) papluPayment = rules.doublePaplu;
        else if (playerData.status.papluCount === 3) papluPayment = rules.triplePaplu;

        if (papluPayment > 0) {
            allPlayerStatuses.forEach(otherPlayer => {
                if (otherPlayer.playerId !== playerData.playerId) {
                    finalScores[playerData.playerId] += papluPayment;
                    finalScores[otherPlayer.playerId] -= papluPayment;
                }
            });
        }
    });

    // --- Stage 2: Winner payouts ---
    const winnerData = allPlayerStatuses.find(p => p.status.outcome === 'Winner');
    if (winnerData) {
        const winnerId = winnerData.playerId;

        allPlayerStatuses.forEach(loserData => {
            if (loserData.playerId === winnerId) return; // skip winner

            const loserId = loserData.playerId;
            const loserStatus = loserData.status;
            let amountOwed = 0;

            switch (loserStatus.outcome) {
                case 'Scoot':
                    amountOwed = rules.scoot;
                    break;
                case 'MidScoot':
                    amountOwed = rules.midScoot;
                    break;
                case 'Full':
                    amountOwed = rules.full;
                    break;
                case 'Playing':
                    // Points are from the loser's hand, so they are a positive value.
                    amountOwed = Math.abs(loserStatus.points || 0) * rules.perPoint;
                    break;
            }
            
            // Apply Gate logic: If winner OR loser has Gate, double points for 'Playing' or 'Full'.
            // Gate does not apply to Scoot or MidScoot.
            const isGateInvolved = winnerData.status.isGate || loserStatus.isGate;
            const isEligibleForGate = loserStatus.outcome === 'Playing' || loserStatus.outcome === 'Full';

            if (isGateInvolved && isEligibleForGate) {
                amountOwed *= 2;
            }

            finalScores[loserId] -= amountOwed;
            finalScores[winnerId] += amountOwed;
        });
    }

    return finalScores;
}
