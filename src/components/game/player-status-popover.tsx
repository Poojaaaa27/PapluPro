
"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
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
    points: 0,
    isGate: false,
}

export function PlayerStatusPopover({ children, status, onSave }: PlayerStatusPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<PlayerStatus>(status || defaultStatus);

  const handleSave = () => {
    onSave(currentStatus);
    setIsOpen(false);
  };

  const handleReset = () => {
    setCurrentStatus(defaultStatus);
  }

  const isPlaying = currentStatus.outcome === 'Playing';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none font-headline">Update Status</h4>
            <p className="text-sm text-muted-foreground">
              Set the player's status for this round.
            </p>
          </div>
          <div className="grid gap-4">
            {/* Bonuses & Special Cards */}
            <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="is3C-switch" className="font-headline">3 Card Hand (3C)</Label>
                    <Switch
                        id="is3C-switch"
                        checked={currentStatus.is3C}
                        onCheckedChange={(checked) => setCurrentStatus(s => ({...s, is3C: checked}))}
                    />
                </div>
                 <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="isGate-switch" className="font-headline">Gate (G)</Label>
                    <Switch
                        id="isGate-switch"
                        checked={currentStatus.isGate}
                        onCheckedChange={(checked) => setCurrentStatus(s => ({...s, isGate: checked}))}
                    />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="paplu-select" className="font-headline col-span-1">Paplu</Label>
                  <Select
                    value={String(currentStatus.papluCount)}
                    onValueChange={(val) => setCurrentStatus(s => ({...s, papluCount: Number(val) as PapluCount}))}
                  >
                    <SelectTrigger id="paplu-select" className="col-span-2 h-8">
                      <SelectValue placeholder="Select Paplu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="1">Single Paplu (1P)</SelectItem>
                      <SelectItem value="2">Double Paplu (2P)</SelectItem>
                      <SelectItem value="3">Triple Paplu (3P)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>

            {/* Round Outcome */}
            <div className="grid grid-cols-3 items-center gap-4 border-t pt-4">
              <Label htmlFor="outcome-select" className="font-headline col-span-1">Outcome</Label>
              <Select
                value={currentStatus.outcome}
                onValueChange={(val) => setCurrentStatus(s => ({...s, outcome: val as RoundOutcome}))}
              >
                <SelectTrigger id="outcome-select" className="col-span-2 h-8">
                  <SelectValue placeholder="Select outcome" />
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

            {/* Conditional Inputs */}
            {isPlaying && (
                <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="points-input" className="font-headline col-span-1">Points</Label>
                    <Input
                        id="points-input"
                        type="number"
                        placeholder="e.g. 25"
                        value={currentStatus.points}
                        onChange={(e) => setCurrentStatus(s => ({...s, points: Number(e.target.value)}))}
                        className="col-span-2 h-8"
                    />
                </div>
            )}
          </div>
          <div className="flex justify-between pt-4 border-t">
            <Button variant="ghost" onClick={handleReset}>Reset</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
