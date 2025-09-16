"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GameRound, Player } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ScoresTableProps {
  rounds: GameRound[];
  players: Player[];
  totalScores: Record<string, number>;
}

export function ScoresTable({ rounds, players, totalScores }: ScoresTableProps) {
  const getRoundTotal = (round: GameRound) => {
    // This function calculates the simple sum of all scores in a given round.
    // There is no balancing; it will display the exact total.
    return Object.values(round.scores).reduce((sum, score) => sum + score, 0);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Live Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    {players.map(player => (
                        <TableHead key={player.id} className="text-center font-headline text-lg">{player.name}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    {players.map(player => (
                        <TableCell key={player.id} className="text-center text-2xl font-bold">
                            <div
                            className={cn(
                                totalScores[player.id] > 0 && "text-green-600",
                                totalScores[player.id] < 0 && "text-red-600"
                            )}
                            >
                            {totalScores[player.id]}
                            </div>
                        </TableCell>
                    ))}
                </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Round by Round</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[80px] font-headline text-center">Round</TableHead>
                  {players.map(player => (
                    <TableHead key={player.id} className="font-headline text-center">
                      {player.name}
                    </TableHead>
                  ))}
                  <TableHead className="w-[80px] font-headline text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rounds.map((round) => {
                  const roundTotal = getRoundTotal(round);
                  const hasScores = Object.values(round.scores).some(score => score !== 0);

                  return (
                    <TableRow key={round.id}>
                      <TableCell className="font-semibold text-center align-middle">{round.id}</TableCell>
                      {players.map(player => {
                        const roundScore = round.scores[player.id] || 0;
                        return (
                          <TableCell key={player.id} className="text-center align-middle">
                            {hasScores && (
                              <span
                                className={cn(
                                  roundScore > 0 && "text-green-600",
                                  roundScore < 0 && "text-red-600"
                                )}
                              >
                                {roundScore}
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="font-semibold text-center align-middle text-muted-foreground">
                        {hasScores ? roundTotal : ''}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
