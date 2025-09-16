
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GameRound, Player, PlayerStatus } from "@/lib/types";
import { PlayerStatusPopover } from "./player-status-popover";
import { getStatusString } from "@/lib/utils";
import { Button } from "../ui/button";

interface RoundsTableProps {
  rounds: GameRound[];
  players: Player[];
  onStatusChange: (roundId: number, playerId: string, newStatus: PlayerStatus) => void;
  isOrganizer: boolean;
}

function PlayerStatusCell({ roundId, playerId, status, onStatusChange, isOrganizer }: { roundId: number, playerId: string, status: PlayerStatus, onStatusChange: RoundsTableProps['onStatusChange'], isOrganizer: boolean }) {

  const displayString = getStatusString(status);

  if (!isOrganizer) {
      return (
          <div className="text-center font-mono p-2 h-10 flex items-center justify-center text-sm">
            {displayString || "-"}
          </div>
      );
  }

  return (
    <PlayerStatusPopover
      status={status}
      onSave={(newStatus) => onStatusChange(roundId, playerId, newStatus)}
    >
        <Button variant="ghost" className="w-full h-12 font-mono text-xs text-center flex-wrap">
            {displayString || <span className="text-muted-foreground">Set Status</span>}
        </Button>
    </PlayerStatusPopover>
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
                        status={round.playerStatus[player.id]}
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
