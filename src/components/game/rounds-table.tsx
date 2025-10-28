
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
import { AlertCircle, Edit, CheckCircle, Lock } from "lucide-react";

interface RoundsTableProps {
  rounds: GameRound[];
  players: Player[];
  onStatusChange: (
    roundId: number,
    playerId: string,
    newStatus: PlayerStatus
  ) => void;
  onToggleComplete: (roundId: number) => void;
  isOrganizer: boolean;
  roundErrors?: Record<number, string>;
}

function PlayerStatusCell({
  roundId,
  playerId,
  status,
  onStatusChange,
  isOrganizer,
  isLocked,
}: {
  roundId: number;
  playerId: string;
  status: PlayerStatus;
  onStatusChange: RoundsTableProps["onStatusChange"];
  isOrganizer: boolean;
  isLocked: boolean;
}) {
  const displayString = getStatusString(status);

  const cellContent = (
    <div className="text-center font-mono p-2 h-12 flex items-center justify-center text-sm break-words whitespace-pre-wrap">
      {displayString || "-"}
    </div>
  );

  if (!isOrganizer || isLocked) {
    return cellContent;
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
  onToggleComplete,
  isOrganizer,
  roundErrors = {},
}: RoundsTableProps) {

  return (
    <div className="rounded-md border relative max-h-[70vh] overflow-auto">
      <Table className="w-full border-collapse min-w-[800px]">
        <TableHeader className="sticky top-0 z-30 bg-background">
          <TableRow>
            <TableHead className="w-[150px] text-center sticky left-0 top-0 z-30 bg-inherit font-headline text-lg border-b border-r">
              Round
            </TableHead>
            {players.map((player) => (
              <TableHead key={player.id} className="text-center font-headline text-lg font-bold sticky top-0 z-20 bg-inherit border-b">
                {player.name}
              </TableHead>
            ))}
            {isOrganizer && (
              <TableHead className="w-[120px] text-center sticky right-0 top-0 z-30 bg-inherit font-headline text-lg border-b border-l">
                Action
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rounds.map((round) => {
            const isComplete = round.isComplete;
            const hasError = !!roundErrors[round.id];

            const rowBgClass = hasError && round.isComplete
              ? "bg-destructive/10"
              : isComplete
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
                        <div className="flex items-center gap-1 text-destructive text-xs mt-1 text-center max-w-[120px]">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <p>{roundErrors[round.id]}</p>
                        </div>
                    )}
                  </div>
                </TableCell>
                {players.map((player) => (
                  <TableCell key={player.id} className={cn("p-1 text-center", isComplete && isOrganizer && "cursor-not-allowed")}>
                    <PlayerStatusCell
                      roundId={round.id}
                      playerId={player.id}
                      status={round.playerStatus[player.id]}
                      onStatusChange={onStatusChange}
                      isOrganizer={isOrganizer}
                      isLocked={isComplete}
                    />
                  </TableCell>
                ))}
                {isOrganizer && (
                    <TableCell className="w-[120px] text-center sticky right-0 z-20 bg-inherit border-l">
                        {isComplete ? (
                            <Button variant="outline" size="sm" onClick={() => onToggleComplete(round.id)}>
                                <Edit /> Edit
                            </Button>
                        ) : (
                            <Button variant="secondary" size="sm" onClick={() => onToggleComplete(round.id)}>
                                <CheckCircle /> Complete
                            </Button>
                        )}
                    </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
