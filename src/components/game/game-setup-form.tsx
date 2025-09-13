"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Player } from "@/lib/types";
import { Trash2, UserPlus, Users } from "lucide-react";

interface GameSetupFormProps {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    gameDetails: { location: string, teamName: string };
    setGameDetails: React.Dispatch<React.SetStateAction<{ location: string, teamName: string }>>;
    isOrganizer: boolean;
}

export function GameSetupForm({ players, setPlayers, gameDetails, setGameDetails, isOrganizer }: GameSetupFormProps) {
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (newPlayerName.trim() && !players.find(p => p.name === newPlayerName.trim())) {
      const newPlayer: Player = {
        id: (players.length + 1).toString(),
        name: newPlayerName.trim(),
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(player => player.id !== id));
  };
  
  if (!isOrganizer) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Game Setup</CardTitle>
                <CardDescription>Current game configuration. Only organizers can make changes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <h3 className="font-headline text-lg mb-2">Game Details</h3>
                    <p><strong>Location:</strong> {gameDetails.location}</p>
                    <p><strong>Team Name:</strong> {gameDetails.teamName}</p>
                </div>
                <div>
                    <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><Users />Players</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        {players.map(player => <li key={player.id}>{player.name}</li>)}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Game Setup</CardTitle>
        <CardDescription>Configure the details for the current game session.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="location" className="font-headline">Location</Label>
          <Input id="location" value={gameDetails.location} onChange={(e) => setGameDetails(prev => ({ ...prev, location: e.target.value }))} placeholder="e.g., Clubhouse" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="teamName" className="font-headline">Team Name</Label>
          <Input id="teamName" value={gameDetails.teamName} onChange={(e) => setGameDetails(prev => ({ ...prev, teamName: e.target.value }))} placeholder="e.g., The Aces" />
        </div>
        <div className="space-y-4">
          <Label className="font-headline">Players</Label>
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-2">
                <Input value={player.name} readOnly className="bg-muted" />
                <Button variant="ghost" size="icon" onClick={() => removePlayer(player.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input 
              value={newPlayerName} 
              onChange={(e) => setNewPlayerName(e.target.value)} 
              placeholder="New player name" 
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
            />
            <Button onClick={addPlayer}><UserPlus className="mr-2 h-4 w-4" /> Add Player</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
