
"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { GameDetails, Player } from "@/lib/types";
import { Trash2, UserPlus, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Switch } from '../ui/switch';

interface GameSetupFormProps {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    gameDetails: GameDetails;
    setGameDetails: React.Dispatch<React.SetStateAction<GameDetails>>;
    isOrganizer: boolean;
}

export function GameSetupForm({ players, setPlayers, gameDetails, setGameDetails, isOrganizer }: GameSetupFormProps) {
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (newPlayerName.trim() && !players.find(p => p.name === newPlayerName.trim())) {
      const newPlayer: Player = {
        id: `${Date.now()}-${Math.random()}`,
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
                    <p><strong>Date:</strong> {gameDetails.date ? format(new Date(gameDetails.date), "PPP") : 'Not set'}</p>
                    <p><strong>3 Card Game:</strong> {gameDetails.is3CardGame ? 'Yes' : 'No'}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
                <Label htmlFor="location" className="font-headline">Location</Label>
                <Input id="location" value={gameDetails.location} onChange={(e) => setGameDetails(prev => ({ ...prev, location: e.target.value }))} placeholder="e.g., Clubhouse" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="teamName" className="font-headline">Team Name</Label>
                <Input id="teamName" value={gameDetails.teamName} onChange={(e) => setGameDetails(prev => ({ ...prev, teamName: e.target.value }))} placeholder="e.g., The Aces" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="gameDate" className="font-headline">Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="gameDate"
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !gameDetails.date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {gameDetails.date ? format(new Date(gameDetails.date), "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={gameDetails.date ? new Date(gameDetails.date) : undefined}
                        onSelect={(date) => setGameDetails(prev => ({ ...prev, date: date ? format(date, 'yyyy-MM-dd') : '' }))}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            </div>
             <div className="flex items-center space-x-2">
                <Switch 
                    id="is3CardGame"
                    checked={gameDetails.is3CardGame}
                    onCheckedChange={(checked) => setGameDetails(prev => ({...prev, is3CardGame: checked}))}
                />
                <Label htmlFor="is3CardGame" className="font-headline">3 Card Game</Label>
            </div>
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
