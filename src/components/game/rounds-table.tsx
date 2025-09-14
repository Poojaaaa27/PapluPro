"use client";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GameRound, Player } from "@/lib/types";

interface RoundsTableProps {
  rounds: GameRound[];
  players: Player[];
  onStatusChange: (roundId: number, playerId: string, status: string) => void;
  isOrganizer: boolean;
}

export function RoundsTable({ rounds, players, onStatusChange, isOrganizer }: RoundsTableProps) {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {rounds.map((round) => (
            <TableRow key={round.id}>
              <TableCell className="font-medium text-center align-middle">{round.id}</TableCell>
              {players.map((player) => (
                <TableCell key={player.id} className="p-1">
                  <Input
                    type="text"
                    className="text-center font-mono"
                    placeholder="-"
                    value={round.playerStatus[player.id] || ""}
                    onChange={(e) => onStatusChange(round.id, player.id, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    disabled={!isOrganizer}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
