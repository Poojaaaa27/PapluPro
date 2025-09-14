import type { Player, GameRules } from "./types";

/**
 * Parses a player's status code for a single round and calculates their individual point value.
 * This function calculates the value based on the provided rules.
 * @param code The player's status code (e.g., "1P-25", "MS").
 * @param rules The current game rules with point values.
 * @returns The calculated point value for that player's status.
 */
export function parsePlayerStatus(code: string, rules: GameRules): number {
    const upperCode = code.toUpperCase().trim();
    if (upperCode === "3C") return 0; // Winner base points is 0 before calculations

    let score = 0;
    const parts = upperCode.split('-');

    let papluValue = 0;
    let hasPaplu = false;

    // First, find and set aside Paplu points from any part
    for (const part of parts) {
        const papluMatch = part.match(/(\d+)P/);
        if (papluMatch) {
            hasPaplu = true;
            const papluCount = parseInt(papluMatch[1], 10);
            if (papluCount === 1) papluValue += rules.singlePaplu;
            else if (papluCount === 2) papluValue += rules.doublePaplu;
            else if (papluCount === 3) papluValue += rules.triplePaplu;
        }
    }
    
    for (const part of parts) {
        // Handle non-paplu parts
        const cleanPart = part.replace(/(\d+)P/, "").trim();
        if (cleanPart) {
             if (cleanPart.includes("F")) {
                score += rules.full;
            } else if (cleanPart.includes("MS")) {
                score += rules.midScoot;
            } else if (cleanPart.includes("S")) {
                score += rules.scoot;
            }
            // Match standalone numeric values
            const numeralMatch = cleanPart.match(/^\d+$/);
            if (numeralMatch) {
                score += parseInt(numeralMatch[0], 10) * rules.perPoint;
            }
        }
    }
    
    // For losers, Paplu is a penalty. For winners, it's a bonus.
    // This function calculates base value, so we handle penalties/bonuses in the main calculator.
    // Here we just add them together, main function will decide if it's +/-
    score += papluValue;

    return score;
}

/**
 * Calculates the scores for all players for a single round based on their status codes.
 * @param playerStatus A record of player IDs to their status codes for the round.
 * @param players An array of all players in the game.
 * @param rules The current game rules.
 * @param is3CardGame A boolean indicating if it's a 3-card game.
 * @returns A record of player IDs to their calculated scores for the round.
 */
export function calculateRoundScores(
    playerStatus: Record<string, string>,
    players: Player[],
    rules: GameRules,
    is3CardGame: boolean
): Record<string, number> {
    const scores: Record<string, number> = {};
    const winners: string[] = [];
    
    if (is3CardGame) {
        players.forEach(player => {
            const status = (playerStatus[player.id] || "").trim().toUpperCase();
            if (status.includes("3C")) {
                winners.push(player.id);
            }
        });
    }

    // Initialize all scores to 0
    players.forEach(p => scores[p.id] = 0);

    // Case 1: Exactly one winner (only in 3-card games)
    if (is3CardGame && winners.length === 1) {
        const winnerId = winners[0];
        let totalLoserPoints = 0;
        
        // Calculate points for all losers
        players.forEach(player => {
            if (player.id !== winnerId) {
                const status = playerStatus[player.id] || "";
                const points = parsePlayerStatus(status, rules);
                scores[player.id] = -points;
                totalLoserPoints += points;
            }
        });

        // Add Atta Kasu for each loser
        const loserCount = players.length - 1;
        totalLoserPoints += loserCount * rules.attaKasu;

        // The winner also gets points for their own status (e.g., paplus)
        const winnerStatus = playerStatus[winnerId] || "";
        const winnerBonusPoints = parsePlayerStatus(winnerStatus, rules);
        totalLoserPoints += winnerBonusPoints;

        // Assign final score to winner
        scores[winnerId] = totalLoserPoints;

        return scores;
    }

    // Case 2: No winners OR not a 3-card game. Calculate individual negative scores.
    // Also covers invalid state of multiple winners by treating it as a no-winner round.
    players.forEach(player => {
        const status = playerStatus[player.id] || "";
        // Don't score empty statuses
        if(status.trim() === "") {
            scores[player.id] = 0;
        } else {
            scores[player.id] = -parsePlayerStatus(status, rules);
        }
    });

    return scores;
}