
"use client";

import { useMemo } from "react";
import { RoundsTable } from "@/components/game/rounds-table";
import { GameSetupForm } from "@/components/game/game-setup-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useGame } from "@/hooks/use-game";
import { Save, Trash2, PlusCircle, AlertCircle } from "lucide-react";
import { useHistory } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";
import type { GameSession } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GamePage() {
  const { user } = useAuth();
  const { 
    players, 
    updatePlayers, 
    rounds, 
    gameDetails, 
    setGameDetails, 
    handleStatusChange,
    resetGame,
    addRound,
  } = useGame();
  const { addGameSession } = useHistory();
  const { toast } = useToast();
  
  const isOrganizer = user?.role === 'organizer';

  const handleSaveGame = () => {
    if (validationError) {
       toast({
        variant: "destructive",
        title: "Cannot Save Game",
        description: `Please fix the error before saving: ${validationError}`,
      });
      return;
    }
    const newGameSession: GameSession = {
      id: `${Date.now()}`,
      ...gameDetails,
      players,
      rounds,
      status: "Completed",
    };
    addGameSession(newGameSession);
    toast({
      title: "Game Saved",
      description: `The game "${gameDetails.teamName}" has been saved to your history.`,
    });
  };

  const getRoundStatus = (round: GameSession['rounds'][0]) => {
    const hasWinner = Object.values(round.playerStatus).some(
      (status) => status.outcome === "Winner"
    );
    const hasScores = Object.values(round.scores).some((score) => score !== 0);
    return hasWinner || hasScores ? "completed" : "pending";
  };

  const validationError = useMemo(() => {
    if (!gameDetails.is3CardGame) return null;

    for (const round of rounds) {
        // We only validate completed rounds. A round is completed if it has entries.
        const isRoundCompleted = Object.values(round.playerStatus).some(
            (s) => s.outcome !== 'Playing' || s.is3C || s.papluCount > 0 || s.points !== null
        );
        if (!isRoundCompleted) continue;

        const winnerCount = Object.values(round.playerStatus).filter(s => s.outcome === 'Winner').length;
        const papluCount = Object.values(round.playerStatus).reduce((acc, s) => acc + s.papluCount, 0);

        if (winnerCount !== 1) {
            return `Round ${round.id}: There must be exactly one winner (Declare). Found: ${winnerCount}.`;
        }
        if (papluCount > 3) {
            return `Round ${round.id}: A maximum of 3 Paplus are allowed per round. Found: ${papluCount}.`;
        }
    }

    return null;
  }, [rounds, gameDetails.is3CardGame]);

  const handleAddRound = () => {
    if (validationError) {
      toast({
        variant: "destructive",
        title: "Invalid Round",
        description: `Cannot add a new round until the error is fixed: ${validationError}`,
      });
      return;
    }
    addRound();
  };


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
            <Button variant="outline" onClick={handleSaveGame}><Save /> Save Game</Button>
            <Button variant="destructive" onClick={resetGame}><Trash2 /> Reset</Button>
          </div>
        )}
      </div>
      
      {validationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

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
            {isOrganizer && (
              <div className="flex justify-center mt-4">
                <Button onClick={handleAddRound} variant="outline" disabled={!!validationError}>
                  <PlusCircle />
                  Add Round
                </Button>
              </div>
            )}
        </TabsContent>
        <TabsContent value="setup" className="mt-6">
          <GameSetupForm 
            players={players} 
            setPlayers={updatePlayers}
            gameDetails={gameDetails}
            setGameDetails={setGameDetails}
            isOrganizer={isOrganizer}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
