
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
import { getStatusString, cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useGame } from "@/hooks/use-game";
import { PlusCircle } from "lucide-react";

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
  const { addRound } = useGame();

  const getRoundStatus = (round: GameRound) => {
    const hasWinner = Object.values(round.playerStatus).some(
      (status) => status.outcome === 'Winner'
    );
    const hasScores = Object.values(round.scores).some(score => score !== 0);
    return hasWinner || hasScores ? 'completed' : 'pending';
  };
  

  const currentRoundIndex = rounds.findIndex(r => getRoundStatus(r) === 'pending');

  return (
    <div className="space-y-4">
      <div className="rounded-md border max-h-[70vh] overflow-auto relative">
        <Table className="w-full border-collapse">
          <TableHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm shadow-sm">
            <TableRow>
              <TableHead className="w-[80px] font-headline text-center bg-inherit sticky left-0 top-0 z-40 shadow-sm">
                Round
              </TableHead>
              {players.map((player) => (
                <TableHead
                  key={player.id}
                  className="font-headline text-center bg-inherit sticky top-0 z-30"
                >
                  {player.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rounds.map((round, index) => {
              const status = getRoundStatus(round);
              const isCurrent = index === currentRoundIndex && currentRoundIndex !== -1;

              return (
                <TableRow 
                  key={round.id}
                  className={cn(
                    status === 'completed' && 'bg-green-100/50 dark:bg-green-900/40',
                    isCurrent && 'bg-blue-100/50 dark:bg-blue-900/40'
                  )}
                >
                  <TableCell className="font-medium text-center align-middle sticky left-0 bg-inherit z-10">
                    {round.id}
                  </TableCell>
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
              )
            })}
          </TableBody>
        </Table>
      </div>
      {isOrganizer && (
        <div className="flex justify-center">
            <Button onClick={addRound} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Round
            </Button>
        </div>
      )}
    </div>
  );
}

