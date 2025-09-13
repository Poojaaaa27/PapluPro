'use server';
/**
 * @fileOverview A flow for calculating Paplu game scores.
 *
 * - calculateScores - Calculates scores for a round based on game events.
 * - ScoreCalculationInput - The input type for the calculateScores function.
 * - ScoreCalculationOutput - The return type for the calculateScores function.
 */

import { ai } from '@/ai/genkit';
import type { Player, PapluType } from '@/lib/types';
import { z } from 'genkit';

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const RoundInputSchema = z.object({
    winnerId: z.string().describe("The ID of the player who won the round."),
    paplu: z.enum(['single', 'double', 'triple']).nullable().describe("The type of Paplu achieved, if any."),
    pointValue: z.number().describe("The base value of each point for this round."),
    scoot: z.boolean().describe("Whether a 'Scoot' event occurred."),
    midScoot: z.boolean().describe("Whether a 'Mid Scoot' event occurred."),
    full: z.boolean().describe("Whether a 'Full' event occurred."),
    attaKasu: z.boolean().describe("Whether an 'Atta Kasu' event occurred.")
});

export const ScoreCalculationInputSchema = z.object({
  round: RoundInputSchema,
  players: z.array(PlayerSchema).describe("An array of all players in the game."),
});
export type ScoreCalculationInput = z.infer<typeof ScoreCalculationInputSchema>;

// The output is a record mapping player IDs to their calculated scores.
export const ScoreCalculationOutputSchema = z.record(z.string(), z.number());
export type ScoreCalculationOutput = z.infer<typeof ScoreCalculationOutputSchema>;


export async function calculateScores(input: ScoreCalculationInput): Promise<ScoreCalculationOutput> {
  return calculateScoresFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateScoresPrompt',
  input: { schema: ScoreCalculationInputSchema },
  output: { schema: ScoreCalculationOutputSchema },
  prompt: `
    You are an expert scorekeeper for the card game Paplu. Your task is to calculate the scores for each player at the end of a round based on a set of events that occurred.

    Here are the scoring rules:
    - Base Value: The points for each event are multiplied by the round's 'Per point' value.
    - Winner: The winner of the round receives the sum of all positive points from the events.
    - Losers: The other players (losers) get a negative score equal to the total points accumulated by the winner.
    - Scoot, Mid Scoot, Full: If any of these events are true, the calculated scores for ALL players (winner and losers) are doubled for each true event. This is cumulative. For example, if Scoot and Mid Scoot are both true, the final scores for everyone are multiplied by 4 (2 for Scoot, 2 for Mid Scoot).
    
    Point values for events:
    - Atta Kasu: 10 points
    - Scoot: 10 points
    - Mid scoot: 20 points
    - Full: 40 points
    - Single paplu: 10 points
    - Double paplu: 30 points
    - Triple paplu: 50 points

    Input Data:
    - Players: {{{json players}}}
    - Round Details: {{{json round}}}

    Your task:
    Calculate the final scores for each player based on the round details and player list provided.
    The output should be a JSON object where keys are player IDs and values are their final integer scores for the round.

    Example Calculation:
    - Players: P1 (winner), P2, P3
    - Events: Single Paplu (10), Atta Kasu (10)
    - Per Point Value: 1
    1. Calculate base points for winner: (10 for Paplu + 10 for Atta Kasu) * 1 = 20 points.
    2. Winner's score (P1): +20
    3. Losers' score (P2, P3): -20 each.
    Final Scores: { "P1": 20, "P2": -20, "P3": -20 }

    Example Calculation with Doubling:
    - Players: P1 (winner), P2, P3
    - Events: Single Paplu (10), Scoot (10)
    - Per Point Value: 1
    1. Calculate base points for winner: (10 for Paplu + 10 for Scoot) * 1 = 20 points.
    2. Scoot is true, so double scores. Base winner score becomes 20 * 2 = 40.
    3. Winner's score (P1): +40
    4. Losers' score (P2, P3): -40 each.
    Final Scores: { "P1": 40, "P2": -40, "P3": -40 }
  `,
});

const calculateScoresFlow = ai.defineFlow(
  {
    name: 'calculateScoresFlow',
    inputSchema: ScoreCalculationInputSchema,
    outputSchema: ScoreCalculationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
