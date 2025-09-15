
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GameRound, Player, PlayerRoundStatus } from "@/lib/types";
import { MoreVertical } from "lucide-react";
import React from "react";

interface RoundsTableProps {
  rounds: GameRound[];
  players: Player[];
  onStatusChange: (roundId: number, playerId: string, newStatus: Partial<PlayerRoundStatus>) => void;
  isOrganizer: boolean;
}

const defaultStatus: PlayerRoundStatus = {
  points: 0,
  isWinner: false,
  isScoot: false,
  isMidScoot: false,
  isFull: false,
  isGate: false,
  is3C: false,
  papluCount: 0,
  rawInput: "",
};

function formatRawInput(status: PlayerRoundStatus): string {
    let parts: string[] = [];
    if (status.isWinner) parts.push("D");
    if (status.isGate) parts.push("G");
    if (status.is3C) parts.push("3C");
    if (status.papluCount === 1) parts.push("1P");
    if (status.papluCount === 2) parts.push("2P");
    if (status.papluCount === 3) parts.push("3P");
    if (status.isScoot) parts.push("S");
    if (status.isMidScoot) parts.push("MS");
    if (status.isFull) parts.push("F");
    if (status.points !== 0) parts.push(status.points.toString());
    
    return parts.join(' ') || "-";
}


function PlayerStatusCell({ roundId, player, status, onStatusChange, isOrganizer }: { roundId: number, player: Player, status: PlayerRoundStatus, onStatusChange: RoundsTableProps['onStatusChange'], isOrganizer: boolean }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleUpdate = (updates: Partial<PlayerRoundStatus>) => {
    onStatusChange(roundId, player.id, updates);
  };
  
  const displayValue = formatRawInput(status);

  if (!isOrganizer) {
      return (
          <div className="text-center font-mono p-2 h-10 flex items-center justify-center">
            {displayValue}
          </div>
      );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full h-10 font-mono justify-between items-center px-2">
           <span className="truncate">{displayValue}</span>
           <MoreVertical className="h-4 w-4 text-muted-foreground ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none font-headline">Status for {player.name}</h4>
            <p className="text-sm text-muted-foreground">
              Set the outcome for this round.
            </p>
          </div>
          <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor={`points-${roundId}-${player.id}`} className="col-span-1">Points</Label>
                  <Input
                      id={`points-${roundId}-${player.id}`}
                      type="number"
                      defaultValue={status.points}
                      className="col-span-2 h-8"
                      onBlur={(e) => handleUpdate({ points: parseInt(e.target.value, 10) || 0 })}
                  />
              </div>
               <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant={status.isWinner ? 'default' : 'outline'} onClick={() => handleUpdate({ isWinner: !status.isWinner, isScoot: false, isMidScoot: false, isFull: false })}>Winner (D)</Button>
                  <Button size="sm" variant={status.isScoot ? 'secondary' : 'outline'} onClick={() => handleUpdate({ isScoot: !status.isScoot, isWinner: false, isMidScoot: false, isFull: false })}>Scoot (S)</Button>
                  <Button size="sm" variant={status.isMidScoot ? 'secondary' : 'outline'} onClick={() => handleUpdate({ isMidScoot: !status.isMidScoot, isWinner: false, isScoot: false, isFull: false })}>Mid Scoot (MS)</Button>
                  <Button size="sm" variant={status.isFull ? 'destructive' : 'outline'} onClick={() => handleUpdate({ isFull: !status.isFull, isWinner: false, isScoot: false, isMidScoot: false })}>Full (F)</Button>
              </div>
              <div className="flex items-center space-x-2">
                  <Checkbox id={`is3c-${roundId}-${player.id}`} checked={status.is3C} onCheckedChange={(checked) => handleUpdate({ is3C: !!checked })}/>
                  <Label htmlFor={`is3c-${roundId}-${player.id}`}>3 Cards (3C)</Label>
              </div>
              <div className="flex items-center space-x-2">
                  <Checkbox id={`isGate-${roundId}-${player.id}`} checked={status.isGate} onCheckedChange={(checked) => handleUpdate({ isGate: !!checked })} />
                  <Label htmlFor={`isGate-${roundId}-${player.id}`}>Gate (G)</Label>
              </div>

              <div>
                  <Label className="font-medium">Paplu</Label>
                   <div className="flex flex-col space-y-1 mt-1">
                      <div className="flex items-center space-x-2">
                          <Checkbox id={`paplu1-${roundId}-${player.id}`} checked={status.papluCount === 1} onCheckedChange={(checked) => handleUpdate({ papluCount: checked ? 1 : 0 })}/>
                          <Label htmlFor={`paplu1-${roundId}-${player.id}`}>1 Paplu (1P)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Checkbox id={`paplu2-${roundId}-${player.id}`} checked={status.papluCount === 2} onCheckedChange={(checked) => handleUpdate({ papluCount: checked ? 2 : 0 })}/>
                          <Label htmlFor={`paplu2-${roundId}-${player.id}`}>2 Paplus (2P)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Checkbox id={`paplu3-${roundId}-${player.id}`} checked={status.papluCount === 3} onCheckedChange={(checked) => handleUpdate({ papluCount: checked ? 3 : 0 })}/>
                          <Label htmlFor={`paplu3-${roundId}-${player.id}`}>3 Paplus (3P)</Label>
                      </div>
                  </div>
              </div>
          </div>
           <Button variant="outline" size="sm" onClick={() => handleUpdate(defaultStatus)}>Clear</Button>
        </div>
      </PopoverContent>
    </Popover>
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
                        player={player}
                        status={round.playerStatus[player.id] || defaultStatus}
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
