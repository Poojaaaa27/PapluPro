
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
import { AlertCircle } from "lucide-react";

interface RoundsTableProps {
  rounds: GameRound[];
  players: Player[];
  onStatusChange: (
    roundId: number,
    playerId: string,
    newStatus: PlayerStatus
  ) => void;
  isOrganizer: boolean;
  roundErrors?: Record<number, string>;
}

function PlayerStatusCell({
  roundId,
  playerId,
  status,
  onStatusChange,
  isOrganizer,
}: {
  roundId: number;
  playerId: string;
  status: PlayerStatus;
  onStatusChange: RoundsTableProps["onStatusChange"];
  isOrganizer: boolean;
}) {
  const displayString = getStatusString(status);

  if (!isOrganizer) {
    return (
      <div className="text-center font-mono p-2 h-12 flex items-center justify-center text-sm">
        {displayString || "-"}
      </div>
    );
  }

  return (
    <PlayerStatusPopover
      status={status}
      onSave={(newStatus) => onStatusChange(roundId, playerId, newStatus)}
    >
      <Button
        variant="ghost"
        className="w-full h-12 font-mono text-xs text-center flex-wrap"
      >
        {displayString || (
          <span className="text-muted-foreground">Set Status</span>
        )}
      </Button>
    </PlayerStatusPopover>
  );
}

export function RoundsTable({
  rounds,
  players,
  onStatusChange,
  isOrganizer,
  roundErrors = {},
}: RoundsTableProps) {
  const getRoundStatus = (round: GameRound) => {
    const hasWinner = Object.values(round.playerStatus).some(
      (status) => status.outcome === "Winner"
    );
    const hasScores = Object.values(round.scores).some((score) => score !== 0);
    return hasWinner || hasScores ? "completed" : "pending";
  };

  const currentRoundIndex = rounds.findIndex(
    (r) => getRoundStatus(r) === "pending"
  );

  return (
    <div className="rounded-md border relative max-h-[70vh] overflow-auto">
      <Table className="w-full border-collapse min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px] text-center sticky left-0 top-0 z-30 bg-background font-headline text-lg border-b border-r">
              Round
            </TableHead>
            {players.map((player) => (
              <TableHead key={player.id} className="text-center font-headline text-lg font-bold sticky top-0 z-20 bg-background border-b">
                {player.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rounds.map((round, index) => {
            const status = getRoundStatus(round);
            const isCurrent =
              index === currentRoundIndex && currentRoundIndex !== -1;
            
            const hasError = !!roundErrors[round.id];

            const rowBgClass = hasError
              ? "bg-destructive/10"
              : isCurrent
              ? "bg-blue-100/50 dark:bg-blue-900/40"
              : status === "completed"
              ? "bg-green-100/50 dark:bg-green-900/40"
              : "";

            return (
              <TableRow
                key={round.id}
                className={cn(rowBgClass, "hover:bg-muted/50")}
              >
                <TableCell className="w-[150px] font-medium text-center sticky left-0 z-20 bg-inherit border-r">
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-bold text-lg">{round.id}</span>
                     {hasError && (
                        <div className="flex items-center gap-1 text-destructive text-xs mt-1 text-center">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <p>{roundErrors[round.id]}</p>
                        </div>
                    )}
                  </div>
                </TableCell>
                {players.map((player) => (
                  <TableCell key={player.id} className="p-1 text-center">
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
