
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
import { AlertCircle, Edit, CheckCircle, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface RoundsTableProps {
  rounds: GameRound[];
  players: Player[];
  onStatusChange: (
    roundId: number,
    playerId: string,
    newStatus: PlayerStatus
  ) => void;
  onToggleComplete?: (roundId: number) => void;
  isOrganizer: boolean;
  roundErrors?: Record<number, string>;
  is3CardGame?: boolean;
  isCanceled?: boolean;
}

function PlayerStatusCell({
  roundId,
  playerId,
  status,
  onStatusChange,
  isOrganizer,
  isLocked,
  children,
  is3CardGame,
}: {
  roundId: number;
  playerId: string;
  status: PlayerStatus;
  onStatusChange: RoundsTableProps["onStatusChange"];
  isOrganizer: boolean;
  isLocked: boolean;
  children: React.ReactNode;
  is3CardGame: boolean;
}) {
  if (!isOrganizer || isLocked) {
    return <div className="p-2 h-12 flex items-center justify-center">{children}</div>;
  }

  return (
    <PlayerStatusPopover
      status={status}
      onSave={(newStatus) => onStatusChange(roundId, playerId, newStatus)}
      is3CardGame={is3CardGame}
    >
      <Button
        variant="ghost"
        className="w-full h-12 font-mono text-xs text-center flex-wrap"
      >
        {children}
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
  is3CardGame = true, // Default to true for backward compatibility on history page
  isCanceled = false,
}: RoundsTableProps) {
  
  return (
    <>
      {/* Desktop Table View */}
      <div className="rounded-md border relative max-h-[70vh] overflow-auto hidden md:block">
        <Table className="w-full border-collapse min-w-[800px]">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="w-[150px] text-center sticky left-0 z-20 bg-inherit font-headline text-lg border-b border-r">
                Round
              </TableHead>
              {players.map((player) => (
                <TableHead key={player.id} className="text-center font-headline text-lg font-bold border-b sticky top-0 bg-background">
                  {player.name}
                </TableHead>
              ))}
              {isOrganizer && onToggleComplete && (
                <TableHead className="w-[120px] text-center sticky right-0 z-20 bg-inherit font-headline text-lg border-b border-l">
                  Action
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rounds.map((round) => {
              const isComplete = round.isComplete;
              const hasError = !!roundErrors[round.id];

              const rowBgClass = isCanceled
                ? "bg-muted/60"
                : hasError
                ? "bg-destructive/10"
                : isComplete
                ? "bg-green-100/50 dark:bg-green-900/40"
                : "";

              return (
                <TableRow
                  key={round.id}
                  className={cn(rowBgClass, "hover:bg-muted/50")}
                >
                  <TableCell className="w-[150px] font-medium text-center sticky left-0 z-10 bg-inherit border-r">
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-bold text-lg">{round.id}</span>
                       {isCanceled && <span className="text-xs font-bold text-muted-foreground">(CANCELED)</span>}
                      {hasError && (
                          <div className="flex items-center gap-1 text-destructive text-xs mt-1 text-center max-w-[120px]">
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              <p>{roundErrors[round.id]}</p>
                          </div>
                      )}
                    </div>
                  </TableCell>
                  {players.map((player) => (
                    <TableCell key={player.id} className={cn("p-1 text-center", isComplete && "cursor-not-allowed")}>
                      <PlayerStatusCell
                        roundId={round.id}
                        playerId={player.id}
                        status={round.playerStatus[player.id]}
                        onStatusChange={onStatusChange}
                        isOrganizer={isOrganizer}
                        isLocked={isComplete || isCanceled}
                        is3CardGame={is3CardGame}
                      >
                         <span className="font-mono text-sm break-words whitespace-pre-wrap">{getStatusString(round.playerStatus[player.id]) || "-"}</span>
                      </PlayerStatusCell>
                    </TableCell>
                  ))}
                  {isOrganizer && onToggleComplete && (
                      <TableCell className="w-[120px] text-center sticky right-0 z-10 bg-inherit border-l">
                          {isComplete ? (
                              <Button variant="outline" size="sm" onClick={() => onToggleComplete(round.id)}>
                                  <Edit /> Edit
                              </Button>
                          ) : (
                              <Button variant="secondary" size="sm" onClick={() => onToggleComplete(round.id)} disabled={hasError}>
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

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {rounds.map(round => {
          const isComplete = round.isComplete;
          const hasError = !!roundErrors[round.id];
          const cardBgClass = isCanceled
            ? "bg-muted/60"
            : hasError
            ? "bg-destructive/10 border-destructive"
            : isComplete
            ? "bg-green-100/50 dark:bg-green-900/40 border-green-500/50"
            : "";

          return (
            <Card key={round.id} className={cn(cardBgClass)}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center font-headline">
                  <span>
                    Round {round.id}
                    {isCanceled && <span className="text-xs font-bold text-muted-foreground ml-2">(CANCELED)</span>}
                  </span>
                  {isOrganizer && onToggleComplete && (
                    isComplete ? (
                        <Button variant="outline" size="sm" onClick={() => onToggleComplete(round.id)}>
                            <Edit /> Edit
                        </Button>
                    ) : (
                        <Button variant="secondary" size="sm" onClick={() => onToggleComplete(round.id)} disabled={hasError}>
                            <CheckCircle /> Complete
                        </Button>
                    )
                  )}
                </CardTitle>
                {hasError && (
                  <CardDescription className="text-destructive flex items-center gap-1 pt-1">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{roundErrors[round.id]}</span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {players.map(player => {
                  const status = round.playerStatus[player.id];
                  const displayString = getStatusString(status) || <span className="text-muted-foreground">Not set</span>;
                  
                  return (
                    <div key={player.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <div className="font-bold font-headline flex items-center gap-2">
                        <User className="w-4 h-4"/>
                        {player.name}
                      </div>
                       <PlayerStatusCell
                        roundId={round.id}
                        playerId={player.id}
                        status={status}
                        onStatusChange={onStatusChange}
                        isOrganizer={isOrganizer}
                        isLocked={isComplete || isCanceled}
                        is3CardGame={is3CardGame}
                      >
                         <div className="font-mono text-sm">{displayString}</div>
                      </PlayerStatusCell>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
