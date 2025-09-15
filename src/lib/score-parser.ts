
import type { Player, GameRules, GameDetails } from "./types";

/**
 * Parses a player's status code to extract distinct parts like paplu count, 
 * numeric value, and flags (S, MS, F, D, G, 3C).
 * @param code The player's status code (e.g., "1P-25", "MS", "3C2P-F-D").
 * @returns An object containing the parsed information.
 */
function getPlayerFlags(code: string) {
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

    // Extracts numeric value, including negative numbers
    const numericMatch = upperCode.match(/-?\d+/);
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
 * @param is3CardGame Whether the 3-card rule is active for this game.
 * @returns A record of player IDs to their calculated scores for the round.
 */
export function calculateRoundScores(
    playerStatus: Record<string, string>,
    players: Player[],
    rules: GameRules,
    is3CardGame: boolean,
): Record<string, number> {
    const scores: Record<string, number> = {};
    players.forEach(p => scores[p.id] = 0);
    const numPlayers = players.length;
    if (numPlayers === 0) return scores;

    // === Step 1: Identify Winner and Losers ===
    const allPlayerFlags: Record<string, ReturnType<typeof getPlayerFlags>> = {};
    let winnerId: string | null = null;
    players.forEach(p => {
        const flags = getPlayerFlags(playerStatus[p.id] || "");
        allPlayerFlags[p.id] = flags;
        if (flags.isWinner) {
            winnerId = p.id;
        }
    });

    // === Step 2: Handle "No Winner" Scenario ===
    if (!winnerId) {
        // In a no-winner round, each player's hand has a value they lose.
        players.forEach(p => {
            const flags = allPlayerFlags[p.id];
            let handValue = 0;

            if (flags.isScoot) handValue += rules.scoot;
            else if (flags.isMidScoot) handValue += rules.midScoot;
            else if (flags.isFull) handValue += rules.full;
            else handValue += Math.abs(flags.points);

            if (flags.papluCount === 1) handValue += rules.singlePaplu;
            if (flags.papluCount === 2) handValue += rules.doublePaplu;
            if (flags.papluCount === 3) handValue += rules.triplePaplu;

            // In a no-winner scenario, attaKasu might not apply or applies differently.
            // Assuming for now that if 3C is present, it's just a hand value.
            if (is3CardGame && flags.is3C) {
                // This logic might need refinement based on specific rules for 3C in no-winner rounds.
                // For now, treating it as a payment to the pot (which doesn't exist here).
            }

            scores[p.id] = -handValue;
        });
        return scores;
    }

    // === Step 3: Handle "Winner" Scenario ===
    const winnerFlags = allPlayerFlags[winnerId];
    let totalPot = 0;

    players.forEach(p => {
        if (p.id === winnerId) return; // Skip the winner

        const loserFlags = allPlayerFlags[p.id];
        let amountOwed = 0;

        // Determine base amount owed from game status
        if (loserFlags.isScoot) {
            amountOwed = rules.scoot;
        } else if (loserFlags.isMidScoot) {
            amountOwed = rules.midScoot;
        } else if (loserFlags.isFull) {
            amountOwed = rules.full;
        } else {
            amountOwed = Math.abs(loserFlags.points);
        }

        // Add Paplu values for the loser
        if (loserFlags.papluCount === 1) amountOwed += rules.singlePaplu;
        if (loserFlags.papluCount === 2) amountOwed += rules.doublePaplu;
        if (loserFlags.papluCount === 3) amountOwed += rules.triplePaplu;
        
        // Add attaKasu if the loser had 3C
        if (is3CardGame && loserFlags.is3C) {
            amountOwed += rules.attaKasu;
        }

        // Apply Gate from winner (doubles the calculated amount)
        if (winnerFlags.isGate && !loserFlags.isScoot && !loserFlags.isMidScoot) {
            amountOwed *= 2;
        }

        scores[p.id] = -amountOwed;
        totalPot += amountOwed;
    });

    // The winner also has their own paplu/3c values which they "win" from the pot
    let winnerSelfValue = 0;
    if (winnerFlags.papluCount === 1) winnerSelfValue += rules.singlePaplu;
    if (winnerFlags.papluCount === 2) winnerSelfValue += rules.doublePaplu;
    if (winnerFlags.papluCount === 3) winnerSelfValue += rules.triplePaplu;
    if (is3CardGame && winnerFlags.is3C) winnerSelfValue += rules.attaKasu;
    
    // The winner's score is the total pot from losers.
    scores[winnerId] = totalPot;

    return scores;
}
