"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { GameRound, PapluType, Player } from "@/lib/types";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "../ui/checkbox";
import { calculateScores } from "@/ai/flows/calculate-scores-flow";
import { Loader2 } from "lucide-react";

interface ScoreEntryDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  players: Player[];
  setRounds: React.Dispatch<React.SetStateAction<GameRound[]>>;
  editingRound: GameRound | null;
}

export function ScoreEntryDialog({
  isOpen,
  setIsOpen,
  players,
  setRounds,
  editingRound,
}: ScoreEntryDialogProps) {
  const { toast } = useToast();
  const [winnerId, setWinnerId] = useState<string>("");
  const [paplu, setPaplu] = useState<PapluType>(null);
  const [pointValue, setPointValue] = useState(1);
  const [scoot, setScoot] = useState(false);
  const [midScoot, setMidScoot] = useState(false);
  const [full, setFull] = useState(false);
  const [attaKasu, setAttaKasu] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (editingRound) {
            setWinnerId(editingRound.winnerId);
            setPaplu(editingRound.paplu);
            setPointValue(editingRound.pointValue);
            setScoot(editingRound.scoot);
            setMidScoot(editingRound.midScoot);
            setFull(editingRound.full);
            setAttaKasu(editingRound.attaKasu);
        } else {
            resetForm();
        }
    }
  }, [editingRound, isOpen]);

  const resetForm = () => {
    setWinnerId("");
    setPaplu(null);
    setPointValue(1);
    setScoot(false);
    setMidScoot(false);
    setFull(false);
    setAttaKasu(false);
  };

  const handleSubmit = async () => {
    if (!winnerId) {
      toast({
        title: "Validation Error",
        description: "Please select a winner.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    try {
        const roundData = {
            winnerId,
            paplu,
            pointValue,
            scoot,
            midScoot,
            full,
            attaKasu,
        };

        const calculatedScores = await calculateScores({ round: roundData, players });

        const newRound: GameRound = {
            id: editingRound ? editingRound.id : new Date().getTime(),
            ...roundData,
            scores: calculatedScores,
        };

        setRounds((prev) => {
            if (editingRound) {
                return prev.map((r) => (r.id === editingRound.id ? newRound : r));
            }
            return [...prev, newRound].sort((a,b) => a.id - b.id);
        });

        toast({
            title: "Success",
            description: `Round ${editingRound ? "updated" : "added"} successfully.`,
        });
        setIsOpen(false);
    } catch (error) {
         toast({
            title: "Calculation Error",
            description: "Failed to calculate scores. Please try again.",
            variant: "destructive",
        });
        console.error(error);
    } finally {
        setIsCalculating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {editingRound ? "Edit Round" : "Add New Round"}
          </DialogTitle>
          <DialogDescription>
            Enter the details for this round. Scores will be calculated automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="winner" className="text-right font-headline">
              Winner
            </Label>
            <Select value={winnerId} onValueChange={setWinnerId}>
              <SelectTrigger id="winner" className="col-span-3">
                <SelectValue placeholder="Select a winner" />
              </SelectTrigger>
              <SelectContent>
                {players.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paplu" className="text-right font-headline">
              Paplu
            </Label>
            <Select value={paplu || 'none'} onValueChange={(v) => setPaplu(v === 'none' ? null : (v as PapluType))}>
              <SelectTrigger id="paplu" className="col-span-3">
                <SelectValue placeholder="Select paplu type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="single">Single Paplu (10)</SelectItem>
                <SelectItem value="double">Double Paplu (30)</SelectItem>
                <SelectItem value="triple">Triple Paplu (50)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pointValue" className="text-right font-headline">
              Per Point Value
            </Label>
            <Input
              id="pointValue"
              type="number"
              value={pointValue}
              onChange={(e) => setPointValue(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          
          <div className="space-y-4 rounded-md border p-4">
            <h3 className="text-base font-medium font-headline">Game Events</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                    <Switch id="attaKasu" checked={attaKasu} onCheckedChange={setAttaKasu} />
                    <Label htmlFor="attaKasu">Atta Kasu (10)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="scoot" checked={scoot} onCheckedChange={setScoot} />
                    <Label htmlFor="scoot">Scoot (10)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="midScoot" checked={midScoot} onCheckedChange={setMidScoot} />
                    <Label htmlFor="midScoot">Mid Scoot (20)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="full" checked={full} onCheckedChange={setFull} />
                    <Label htmlFor="full">Full (40)</Label>
                </div>
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isCalculating}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isCalculating}>
            {isCalculating && <Loader2 className="animate-spin mr-2"/>}
            {isCalculating ? 'Calculating...' : 'Save Round'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
