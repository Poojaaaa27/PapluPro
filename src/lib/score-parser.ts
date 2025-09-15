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
 * @param rawInput The raw string code (e.g., "1P-25", "3CG-D", "3C1P-D").
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

    const parts = rawInput.toUpperCase().split('-');
    const preDashPart = parts[0] || "";
    const postDashPart = parts[1] || "";

    const combinedParts = preDashPart + postDashPart;
    
    // Check for paplu first and remove them from the string
    if (combinedParts.includes("3P")) {
        status.papluCount = 3;
    } else if (combinedParts.includes("2P")) {
        status.papluCount = 2;
    } else if (combinedParts.includes("1P")) {
        status.papluCount = 1;
    }
    
    // Check for other flags
    if (combinedParts.includes("3C")) status.is3C = true;
    if (combinedParts.includes("G")) status.isGate = true;
    if (combinedParts.includes("D")) status.isWinner = true;

    // Handle post-dash part for scoot, full, or points
    if (postDashPart) {
        if (postDashPart.includes("S")) {
           status.isScoot = true;
        } else if (postDashPart.includes("MS")) {
            status.isMidScoot = true;
        } else if (postDashPart.includes("F")) {
            status.isFull = true;
        }
        
        // Extract numeric points from post-dash part
        const pointMatch = postDashPart.match(/-?\d+/);
        if (pointMatch) {
            status.points = parseInt(pointMatch[0], 10);
        }
    } else { // Handle pre-dash part if no dash
        const pointMatch = preDashPart.match(/-?\d+/);
        if (pointMatch) {
            status.points = parseInt(pointMatch[0], 10);
        }
    }

    return status;
}

/**
 * Calculates scores for a round based on raw input strings.
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
    const scores: Record<string, number> = {};
    players.forEach(p => scores[p.id] = 0);

    if (players.length < 2) return scores;

    const allPlayerFlags = players.map(p => ({
        playerId: p.id,
        flags: parsePlayerStatus(playerStatus[p.id] || "")
    }));

    // --- Stage 1: Global Transactions (Before Winner Payout) ---

    // Transaction 1.1: 3C (attaKasu) Payout
    if (is3CardGame) {
        const threeCardPlayers = allPlayerFlags.filter(p => p.flags.is3C);
        if (threeCardPlayers.length === 1) {
            const threeCardPlayerId = threeCardPlayers[0].playerId;
            const winnings = rules.attaKasu * (players.length - 1);
            scores[threeCardPlayerId] += winnings;
            players.forEach(p => {
                if (p.id !== threeCardPlayerId) {
                    scores[p.id] -= rules.attaKasu;
                }
            });
        }
    }

    // Transaction 1.2: Paplu Payouts
    allPlayerFlags.forEach(playerData => {
        let papluPayment = 0;
        if (playerData.flags.papluCount === 1) papluPayment = rules.singlePaplu;
        else if (playerData.flags.papluCount === 2) papluPayment = rules.doublePaplu;
        else if (playerData.flags.papluCount === 3) papluPayment = rules.triplePaplu;

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

    // --- Stage 2: Main Round Winner Payout ---

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
                amountOwed = Math.abs(loserFlags.points) * rules.perPoint;
            }

            // Gate rule: double the amount owed by non-scoot/mid-scoot players
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
