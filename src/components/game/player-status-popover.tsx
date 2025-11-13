
"use client";

import { useState, type ReactNode, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { PlayerStatus, RoundOutcome, PapluCount } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Check } from "lucide-react";

interface PlayerStatusPopoverProps {
  children: ReactNode;
  status: PlayerStatus;
  onSave: (newStatus: PlayerStatus) => void;
  is3CardGame: boolean;
}

const defaultStatus: PlayerStatus = {
    is3C: false,
    papluCount: 0,
    outcome: 'Playing',
    points: null, // Default points to null
    isGate: false,
}

export function PlayerStatusPopover({ children, status, onSave, is3CardGame }: PlayerStatusPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<PlayerStatus>(status || defaultStatus);

  useEffect(() => {
    if (isOpen) {
        // When opening, if status is null/undefined, use the default. If it exists, use it.
        // If outcome is 'Playing' but points are null, default input to 0 for better UX.
        const initialStatus = status ? { ...status } : { ...defaultStatus };
        if (initialStatus.outcome === 'Playing' && initialStatus.points === null) {
            // This is just for the input field display, not saved yet
        }
        setCurrentStatus(initialStatus);
    }
  }, [isOpen, status]);

  const handleValueChange = (newPartialStatus: Partial<PlayerStatus>) => {
    let newStatus = { ...currentStatus, ...newPartialStatus };
    
    // If outcome is changed to something other than 'Playing', reset points to null.
    if ('outcome' in newPartialStatus && newPartialStatus.outcome !== 'Playing') {
      newStatus.points = null;
    } else if ('outcome' in newPartialStatus && newPartialStatus.outcome === 'Playing') {
      // If switching back to 'Playing', points remain null until set
      newStatus.points = currentStatus.points; // Or keep existing points if any
    }
    
    // If not a 3-card game, ensure 3C and paplu are off
    if (!is3CardGame) {
        newStatus.is3C = false;
        newStatus.papluCount = 0;
    }
    
    setCurrentStatus(newStatus);
    onSave(newStatus);
    
    // Close the popover unless the user just switched to 'Playing' which shows the input
    if (!(newPartialStatus.outcome && newPartialStatus.outcome === 'Playing')) {
        setIsOpen(false);
    }
  };

  const handlePointsConfirm = () => {
    // When confirming, if points are still null in the internal state, it means 0 should be saved.
    const newStatus = { ...currentStatus, points: currentStatus.points ?? 0 };
    onSave(newStatus);
    setIsOpen(false);
  }

  const handlePointsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePointsConfirm();
    }
  };

  const isPlaying = currentStatus.outcome === 'Playing';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-2" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="grid gap-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="is3C-switch" className={cn("font-headline text-sm", !is3CardGame && "text-muted-foreground")}>3 Card (3C)</Label>
                    <Switch
                        id="is3C-switch"
                        checked={currentStatus.is3C}
                        onCheckedChange={(checked) => handleValueChange({ is3C: checked })}
                        disabled={!is3CardGame}
                    />
                </div>
                 <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="isGate-switch" className="font-headline text-sm">Gate (G)</Label>
                    <Switch
                        id="isGate-switch"
                        checked={currentStatus.isGate}
                        onCheckedChange={(checked) => handleValueChange({ isGate: checked })}
                    />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="paplu-select" className={cn("font-headline text-sm", !is3CardGame && "text-muted-foreground")}>Paplu</Label>
                  <Select
                    value={String(currentStatus.papluCount)}
                    onValueChange={(val) => handleValueChange({ papluCount: Number(val) as PapluCount })}
                    disabled={!is3CardGame}
                  >
                    <SelectTrigger id="paplu-select" className="h-8 w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="1">1P</SelectItem>
                      <SelectItem value="2">2P</SelectItem>
                      <SelectItem value="3">3P</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t pt-2">
              <Label htmlFor="outcome-select" className="font-headline text-sm shrink-0">Outcome</Label>
              <div className="flex gap-1">
                <Select
                  value={currentStatus.outcome}
                  onValueChange={(val) => handleValueChange({ outcome: val as RoundOutcome })}
                >
                  <SelectTrigger id="outcome-select" className="h-8 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Winner">Winner (D)</SelectItem>
                    <SelectItem value="Playing">Playing</SelectItem>
                    <SelectItem value="Full">Full (F)</SelectItem>
                    <SelectItem value="Scoot">Scoot (S)</SelectItem>
                    <SelectItem value="MidScoot">Mid Scoot (MS)</SelectItem>
                  </SelectContent>
                </Select>
                {isPlaying && (
                    <>
                    <Input
                        id="points-input"
                        type="number"
                        placeholder="Pts"
                        // Display 0 if points are null, otherwise show the points value
                        value={currentStatus.points ?? 0}
                        onChange={(e) => {
                            const value = e.target.value;
                            setCurrentStatus(s => ({ ...s, points: value === '' ? null : Number(value) }))
                        }}
                        onKeyDown={handlePointsKeyDown}
                        className="h-8 w-[60px] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                        autoFocus
                    />
                    <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handlePointsConfirm}>
                        <Check className="h-4 w-4" />
                    </Button>
                    </>
                )}
              </div>
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
