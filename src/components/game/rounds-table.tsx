
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
  onStatusChange: (roundId: number, playerId: string, rawInput: string) => void;
  isOrganizer: boolean;
}

function PlayerStatusCell({ roundId, playerId, value, onStatusChange, isOrganizer }: { roundId: number, playerId: string, value: string, onStatusChange: RoundsTableProps['onStatusChange'], isOrganizer: boolean }) {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStatusChange(roundId, playerId, e.target.value.toUpperCase());
  };

  if (!isOrganizer) {
      return (
          <div className="text-center font-mono p-2 h-10 flex items-center justify-center">
            {value || "-"}
          </div>
      );
  }

  return (
    <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        className="w-full h-10 font-mono text-center"
        placeholder="e.g., 1P-25"
    />
  )
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
                   <PlayerStatusCell 
                        roundId={round.id}
                        playerId={player.id}
                        value={round.playerStatus[player.id] || ""}
                        onStatusChange={onStatusChange}
                        isOrganizer={isOrganizer}
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
