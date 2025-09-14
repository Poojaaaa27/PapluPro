"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import type { GameRound, Player } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ScoresTableProps {
  rounds: GameRound[];
  players: Player[];
  totalScores: Record<string, number>;
}

export function ScoresTable({ rounds, players, totalScores }: ScoresTableProps) {

  const getRoundTotal = (round: GameRound) => {
    return Object.values(round.scores).reduce((sum, score) => sum + score, 0);
  }

  const getTotalOfTotals = () => {
    return Object.values(totalScores).reduce((sum, score) => sum + score, 0);
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[80px] font-headline text-center">Round</TableHead>
            {players.map((player) => (
              <TableHead key={player.id} className="font-headline text-center">
                {player.name}
              </TableHead>
            ))}
            <TableHead className="w-[80px] font-headline text-center">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rounds.map((round) => (
            <TableRow key={round.id}>
              <TableCell className="font-semibold text-center align-middle">{round.id}</TableCell>
              {players.map((player) => (
                <TableCell key={player.id} className="text-center align-middle">
                   <span className={cn(
                       round.scores[player.id] > 0 && "text-green-600",
                       round.scores[player.id] < 0 && "text-red-600"
                   )}>
                    {round.scores[player.id] ?? '-'}
                   </span>
                </TableCell>
              ))}
              <TableCell className="font-semibold text-center align-middle text-muted-foreground">{getRoundTotal(round)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
            <TableRow className="bg-muted/50 font-bold">
                <TableHead className="text-center font-headline">Total</TableHead>
                {players.map(player => (
                    <TableHead key={player.id} className="text-center text-lg">
                        <div className={cn(
                            totalScores[player.id] > 0 && "text-green-600",
                            totalScores[player.id] < 0 && "text-red-600"
                        )}>
                            {totalScores[player.id]}
                        </div>
                    </TableHead>
                ))}
                <TableHead className="text-center font-headline">{getTotalOfTotals()}</TableHead>
            </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
