
"use client";

import { useState, type ReactNode, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { PlayerStatus, RoundOutcome, PapluCount } from "@/lib/types";

interface PlayerStatusPopoverProps {
  children: ReactNode;
  status: PlayerStatus;
  onSave: (newStatus: PlayerStatus) => void;
}

const defaultStatus: PlayerStatus = {
    is3C: false,
    papluCount: 0,
    outcome: 'Playing',
    points: null,
    isGate: false,
}

export function PlayerStatusPopover({ children, status, onSave }: PlayerStatusPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<PlayerStatus>(status || defaultStatus);

  useEffect(() => {
    // Reset internal state when popover opens with new status
    if (isOpen) {
        setCurrentStatus(status || defaultStatus);
    }
  }, [isOpen, status]);

  const handleValueChange = (newPartialStatus: Partial<PlayerStatus>) => {
    const newStatus = { ...currentStatus, ...newPartialStatus };
    setCurrentStatus(newStatus);

    // Auto-save and close, except for points input which needs explicit blur.
    if (!('points' in newPartialStatus)) {
        onSave(newStatus);
        setIsOpen(false);
    }
  };

  const handlePointsBlur = () => {
    onSave(currentStatus);
    setIsOpen(false);
  }

  const isPlaying = currentStatus.outcome === 'Playing';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-2" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="grid gap-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="is3C-switch" className="font-headline text-sm">3 Card (3C)</Label>
                    <Switch
                        id="is3C-switch"
                        checked={currentStatus.is3C}
                        onCheckedChange={(checked) => handleValueChange({ is3C: checked })}
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
                  <Label htmlFor="paplu-select" className="font-headline text-sm">Paplu</Label>
                  <Select
                    value={String(currentStatus.papluCount)}
                    onValueChange={(val) => handleValueChange({ papluCount: Number(val) as PapluCount })}
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

            <div className="flex items-center justify-between gap-4 border-t pt-2">
              <Label htmlFor="outcome-select" className="font-headline text-sm">Outcome</Label>
              <Select
                value={currentStatus.outcome}
                onValueChange={(val) => handleValueChange({ outcome: val as RoundOutcome })}
              >
                <SelectTrigger id="outcome-select" className="h-8 w-[120px]">
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
            </div>

            {isPlaying && (
                <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="points-input" className="font-headline text-sm">Points</Label>
                    <Input
                        id="points-input"
                        type="number"
                        placeholder="e.g. 25"
                        value={currentStatus.points === null ? '' : currentStatus.points}
                        onChange={(e) => {
                            const value = e.target.value;
                            setCurrentStatus(s => ({ ...s, points: value === '' ? null : Number(value) }))
                        }}
                        onBlur={handlePointsBlur}
                        className="h-8 w-[120px]"
                    />
                </div>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
