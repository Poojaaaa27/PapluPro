"use client";

import { RoundsTable } from "@/components/game/rounds-table";
import { GameSetupForm } from "@/components/game/game-setup-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useGame } from "@/hooks/use-game";
import { Save, Trash2 } from "lucide-react";

export default function GamePage() {
  const { user } = useAuth();
  const { 
    players, 
    setPlayers, 
    rounds, 
    gameDetails, 
    setGameDetails, 
    handleStatusChange,
    resetGame,
  } = useGame();
  
  const isOrganizer = user?.role === 'organizer';

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Game Input
          </h1>
          <p className="text-muted-foreground mt-1">
            {gameDetails.teamName} at {gameDetails.location} | Players: {players.length} | Date: {gameDetails.date}
          </p>
        </div>
        {isOrganizer && (
          <div className="flex gap-2">
            <Button variant="outline"><Save className="mr-2 h-4 w-4" /> Save Game</Button>
            <Button variant="destructive" onClick={resetGame}><Trash2 className="mr-2 h-4 w-4" /> Reset</Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="rounds" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rounds" className="font-headline">Input</TabsTrigger>
          <TabsTrigger value="setup" className="font-headline">Setup</TabsTrigger>
        </TabsList>
        <TabsContent value="rounds" className="mt-6">
            <RoundsTable 
                players={players} 
                rounds={rounds}
                onStatusChange={handleStatusChange}
                isOrganizer={isOrganizer}
            />
        </TabsContent>
        <TabsContent value="setup" className="mt-6">
          <GameSetupForm 
            players={players} 
            setPlayers={setPlayers}
            gameDetails={gameDetails}
            setGameDetails={setGameDetails}
            isOrganizer={isOrganizer}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
