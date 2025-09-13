"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GameRound, Player } from "@/lib/types";
import { Crown, Edit, PlusCircle, TrendingUp, Users, Shield, Bomb, Star, Bolt } from "lucide-react";
import { ScoreEntryDialog } from "./score-entry-dialog";
import { useState } from "react";
import { Badge } from "../ui/badge";

interface RoundsManagerProps {
    rounds: GameRound[];
    players: Player[];
    setRounds: React.Dispatch<React.SetStateAction<GameRound[]>>;
    isOrganizer: boolean;
}

export function RoundsManager({ rounds, players, setRounds, isOrganizer }: RoundsManagerProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRound, setEditingRound] = useState<GameRound | null>(null);

    const handleAddNewRound = () => {
        setEditingRound(null);
        setDialogOpen(true);
    }
    
    const handleEditRound = (round: GameRound) => {
        setEditingRound(round);
        setDialogOpen(true);
    }
    
  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-headline font-bold">Rounds</h2>
            {isOrganizer && (
                <Button onClick={handleAddNewRound}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Round
                </Button>
            )}
        </div>
        {rounds.length === 0 ? (
            <Card className="text-center py-12">
                <CardContent>
                    <h3 className="text-xl font-semibold font-headline">No rounds played yet.</h3>
                    <p className="text-muted-foreground mt-2">Click "Add Round" to get started!</p>
                </CardContent>
            </Card>
        ) : (
            <div className="space-y-4">
                {rounds.map((round, index) => {
                    const winner = players.find(p => p.id === round.winnerId);
                    return (
                        <Card key={index} className="transition-all hover:shadow-md">
                            <CardHeader className="flex flex-row justify-between items-start">
                                <div>
                                    <CardTitle className="font-headline text-xl">Round {round.id}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 pt-1">
                                        <Crown className="w-4 h-4 text-amber-500"/> Winner: <span className="font-semibold">{winner?.name || 'N/A'}</span>
                                    </CardDescription>
                                </div>
                                {isOrganizer && <Button variant="ghost" size="icon" onClick={() => handleEditRound(round)}><Edit className="w-4 h-4"/></Button>}
                            </Header>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    {players.map(player => (
                                        <div key={player.id} className="flex flex-col p-2 bg-muted/50 rounded-md">
                                            <span className="font-semibold text-muted-foreground">{player.name}</span>
                                            <span className={`text-lg font-bold ${round.scores[player.id] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {round.scores[player.id] >= 0 ? '+' : ''}{round.scores[player.id]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                             <CardFooter className="text-xs text-muted-foreground justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4"/>
                                    <span>Point Value: {round.pointValue}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {round.paplu && <Badge variant="secondary" className="capitalize"><Star className="w-3 h-3 mr-1"/>{round.paplu} Paplu</Badge>}
                                    {round.scoot && <Badge variant="destructive"><Users className="w-3 h-3 mr-1"/>Scoot</Badge>}
                                    {round.midScoot && <Badge variant="destructive"><Shield className="w-3 h-3 mr-1"/>Mid Scoot</Badge>}
                                    {round.full && <Badge variant="destructive"><Bomb className="w-3 h-3 mr-1"/>Full</Badge>}
                                    {round.attaKasu && <Badge variant="outline"><Bolt className="w-3 h-3 mr-1"/>Atta Kasu</Badge>}
                                </div>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        )}
        <ScoreEntryDialog 
            isOpen={dialogOpen} 
            setIsOpen={setDialogOpen}
            players={players}
            setRounds={setRounds}
            editingRound={editingRound}
        />
    </div>
  );
}
