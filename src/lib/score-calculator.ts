
import type { Player, PapluType } from '@/lib/types';

interface RoundInput {
    winnerId: string;
    paplu: PapluType;
    pointValue: number;
    scoot: boolean;
    midScoot: boolean;
    full: boolean;
    attaKasu: boolean;
}

export interface ScoreCalculationInput {
  round: RoundInput;
  players: Player[];
}

export type ScoreCalculationOutput = Record<string, number>;

const POINT_VALUES = {
    attaKasu: 10,
    scoot: 10,
    midScoot: 20,
    full: 40,
    single: 10,
    double: 30,
    triple: 50,
};

export function calculateScores(input: ScoreCalculationInput): ScoreCalculationOutput {
    const { round, players } = input;
    
    let winnerBaseScore = 0;

    // Calculate points from events
    if (round.attaKasu) {
        winnerBaseScore += POINT_VALUES.attaKasu;
    }
    if(round.scoot) {
        winnerBaseScore += POINT_VALUES.scoot;
    }
    if (round.midScoot) {
        winnerBaseScore += POINT_VALUES.midScoot;
    }
    if (round.full) {
        winnerBaseScore += POINT_VALUES.full;
    }
    if (round.paplu) {
        winnerBaseScore += POINT_VALUES[round.paplu];
    }
    
    // Apply per-point value
    winnerBaseScore *= round.pointValue;
    
    // Calculate doubling multiplier
    let multiplier = 1;
    if (round.scoot) {
        multiplier *= 2;
    }
    if (round.midScoot) {
        multiplier *= 2;
    }
    if (round.full) {
        multiplier *= 2;
    }

    const finalWinnerScore = winnerBaseScore * multiplier;
    
    const loserCount = players.length - 1;
    if (loserCount <= 0) {
        // Handle case with 1 or 0 players to avoid division by zero
        const scores: ScoreCalculationOutput = {};
        if (players.length === 1 && players[0].id === round.winnerId) {
            scores[players[0].id] = finalWinnerScore;
        }
         return scores;
    }

    const finalLoserScore = -(finalWinnerScore / loserCount);

    const scores: ScoreCalculationOutput = {};
    for (const player of players) {
        if (player.id === round.winnerId) {
            scores[player.id] = finalWinnerScore;
        } else {
            scores[player.id] = finalLoserScore;
        }
    }
    
    return scores;
}
