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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { GameRound, Player } from "@/lib/types";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "../ui/checkbox";

interface ScoreEntryDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    players: Player[];
    setRounds: React.Dispatch<React.SetStateAction<GameRound[]>>;
    editingRound: GameRound | null;
}

export function ScoreEntryDialog({ isOpen, setIsOpen, players, setRounds, editingRound }: ScoreEntryDialogProps) {
    const { toast } = useToast();
    const [winnerId, setWinnerId] = useState<string>('');
    const [paplu, setPaplu] = useState<"single" | "double" | "triple" | "none">("none");
    const [pointValue, setPointValue] = useState(10);
    const [isScoot, setIsScoot] = useState(false);
    const [scootedPlayers, setScootedPlayers] = useState<string[]>([]);
    const [scores, setScores] = useState<Record<string, string>>({});
    
    useEffect(() => {
        if (editingRound) {
            setWinnerId(editingRound.winnerId);
            setPaplu(editingRound.paplu || "none");
            setPointValue(editingRound.pointValue);
            setIsScoot(editingRound.scoot.isScoot);
            setScootedPlayers(editingRound.scoot.scootedPlayers);
            const scoreStrings: Record<string, string> = {};
            Object.entries(editingRound.scores).forEach(([playerId, score]) => {
                scoreStrings[playerId] = score.toString();
            });
            setScores(scoreStrings);
        } else {
            resetForm();
        }
    }, [editingRound, isOpen]);

    const resetForm = () => {
        setWinnerId('');
        setPaplu("none");
        setPointValue(10);
        setIsScoot(false);
        setScootedPlayers([]);
        const initialScores: Record<string, string> = {};
        players.forEach(p => initialScores[p.id] = '0');
        setScores(initialScores);
    }
    
    const handleScoreChange = (playerId: string, value: string) => {
        setScores(prev => ({ ...prev, [playerId]: value }));
    }

    const handleScootedPlayerChange = (playerId: string, checked: boolean) => {
        setScootedPlayers(prev => 
            checked ? [...prev, playerId] : prev.filter(id => id !== playerId)
        );
    }

    const handleSubmit = () => {
        if (!winnerId) {
            toast({ title: "Validation Error", description: "Please select a winner.", variant: "destructive" });
            return;
        }

        const parsedScores: Record<string, number> = {};
        let scoresAreValid = true;
        Object.entries(scores).forEach(([playerId, score]) => {
            const parsed = parseInt(score, 10);
            if (isNaN(parsed)) {
                scoresAreValid = false;
            }
            parsedScores[playerId] = parsed;
        });

        if (!scoresAreValid) {
            toast({ title: "Validation Error", description: "Please enter valid numbers for all scores.", variant: "destructive" });
            return;
        }
        
        const newRound: GameRound = {
            id: editingRound ? editingRound.id : new Date().getTime(),
            winnerId,
            paplu: paplu === "none" ? null : paplu,
            pointValue,
            scoot: {
                isScoot,
                scootedPlayers
            },
            scores: parsedScores
        };

        setRounds(prev => {
            if(editingRound) {
                return prev.map(r => r.id === editingRound.id ? newRound : r);
            }
            return [...prev, newRound];
        });

        toast({ title: "Success", description: `Round ${editingRound ? 'updated' : 'added'} successfully.` });
        setIsOpen(false);
    };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">{editingRound ? 'Edit Round' : 'Add New Round'}</DialogTitle>
          <DialogDescription>
            Enter the details for this round. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="winner" className="text-right font-headline">Winner</Label>
                <Select value={winnerId} onValueChange={setWinnerId}>
                    <SelectTrigger id="winner" className="col-span-3">
                        <SelectValue placeholder="Select a winner" />
                    </SelectTrigger>
                    <SelectContent>
                        {players.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paplu" className="text-right font-headline">Paplu</Label>
                <Select value={paplu} onValueChange={(v) => setPaplu(v as any)}>
                    <SelectTrigger id="paplu" className="col-span-3">
                        <SelectValue placeholder="Select paplu type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="triple">Triple</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pointValue" className="text-right font-headline">Point Value</Label>
                <Input id="pointValue" type="number" value={pointValue} onChange={e => setPointValue(Number(e.target.value))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="scoot" className="text-right font-headline">Scoot</Label>
                 <Switch id="scoot" checked={isScoot} onCheckedChange={setIsScoot} />
            </div>
            {isScoot && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right font-headline">Scooted Players</Label>
                    <div className="col-span-3 grid grid-cols-2 gap-2">
                        {players.map(p => (
                            <div key={p.id} className="flex items-center space-x-2">
                                <Checkbox id={`scoot-${p.id}`} checked={scootedPlayers.includes(p.id)} onCheckedChange={(checked) => handleScootedPlayerChange(p.id, !!checked)} />
                                <Label htmlFor={`scoot-${p.id}`}>{p.name}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="space-y-2 pt-4">
                <Label className="font-headline text-base">Scores</Label>
                <div className="grid grid-cols-2 gap-4">
                {players.map(p => (
                    <div key={p.id} className="grid grid-cols-2 items-center gap-2">
                        <Label htmlFor={`score-${p.id}`} className="text-right">{p.name}</Label>
                        <Input id={`score-${p.id}`} type="text" value={scores[p.id] || ''} onChange={(e) => handleScoreChange(p.id, e.target.value)} placeholder="e.g. 3C2P-MS" />
                    </div>
                ))}
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>Save Round</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
