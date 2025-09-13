"use client";

import { GameSetupForm } from "@/components/game/game-setup-form";
import { LeaderboardTable } from "@/components/game/leaderboard-table";
import { RoundsManager } from "@/components/game/rounds-manager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import type { GameSession, Player, GameRound } from "@/lib/types";
import { Save, Share2, SquarePlus, Trash2 } from "lucide-react";
import { useState } from "react";

const mockPlayers: Player[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
  { id: "4", name: "Diana" },
];

const mockRounds: GameRound[] = [
    { id: 1, winnerId: "1", paplu: "single", scoot: { isScoot: false, scootedPlayers: [] }, scores: { "1": 10, "2": -5, "3": -5, "4": 0 }, pointValue: 10 },
    { id: 2, winnerId: "3", paplu: null, scoot: { isScoot: true, scootedPlayers: ["2"] }, scores: { "1": -10, "2": -20, "3": 30, "4": 0 }, pointValue: 10 },
];


export default function GamePage() {
  const { user } = useAuth();
  const isOrganizer = user?.role === 'organizer';

  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [rounds, setRounds] = useState<GameRound[]>(mockRounds);
  const [gameDetails, setGameDetails] = useState({
      location: "The Den",
      teamName: "The High Rollers"
  });

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Game In Progress
          </h1>
          <p className="text-muted-foreground mt-1">
            {gameDetails.teamName} at {gameDetails.location}
          </p>
        </div>
        {isOrganizer && (
          <div className="flex gap-2">
            <Button variant="outline"><Save className="mr-2" /> Save Game</Button>
            <Button variant="destructive"><Trash2 className="mr-2" /> Reset</Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="rounds" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup" className="font-headline">Game Setup</TabsTrigger>
          <TabsTrigger value="rounds" className="font-headline">Rounds</TabsTrigger>
          <TabsTrigger value="leaderboard" className="font-headline">Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="mt-6">
          <GameSetupForm 
            players={players} 
            setPlayers={setPlayers}
            gameDetails={gameDetails}
            setGameDetails={setGameDetails}
            isOrganizer={isOrganizer}
          />
        </TabsContent>
        <TabsContent value="rounds" className="mt-6">
          <RoundsManager 
            rounds={rounds} 
            players={players} 
            setRounds={setRounds}
            isOrganizer={isOrganizer}
          />
        </TabsContent>
        <TabsContent value="leaderboard" className="mt-6">
          <LeaderboardTable players={players} rounds={rounds} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
