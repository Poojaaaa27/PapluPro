
"use client";

import { useMemo } from "react";
import { RoundsTable } from "@/components/game/rounds-table";
import { GameSetupForm } from "@/components/game/game-setup-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useGame } from "@/hooks/use-game";
import { Save, Trash2, PlusCircle } from "lucide-react";
import { useHistory } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";
import type { GameSession } from "@/lib/types";

export default function GamePage() {
  const { user } = useAuth();
  const { 
    players, 
    updatePlayers, 
    rounds, 
    gameDetails, 
    setGameDetails, 
    handleStatusChange,
    toggleRoundCompletion,
    resetGame,
    addRound,
  } = useGame();
  const { addGameSession } = useHistory();
  const { toast } = useToast();
  
  const isOrganizer = user?.role === 'organizer';

  const roundErrors = useMemo(() => {
    const errors: Record<number, string> = {};
    if (players.length === 0) return errors;

    for (const round of rounds) {
        // --- Paplu validation (real-time) ---
        const papluCount = Object.values(round.playerStatus).reduce((acc, s) => acc + (s?.papluCount || 0), 0);
        if (papluCount > 3) {
            errors[round.id] = `Max 3 Paplus allowed. Found: ${papluCount}.`;
            continue; // Prioritize this error
        }

        // --- Winner and 3C validation (only for completed rounds) ---
        if (round.isComplete) {
            const winnerCount = Object.values(round.playerStatus).filter(s => s?.outcome === 'Winner').length;
            if (winnerCount !== 1) {
                errors[round.id] = `Round must have exactly one Winner (D). Found: ${winnerCount}.`;
                continue;
            }

            if (gameDetails.is3CardGame) {
                const threeCardWinnerCount = Object.values(round.playerStatus).filter(s => s?.is3C).length;
                if (threeCardWinnerCount !== 1) {
                    errors[round.id] = `Round must have one 3C winner. Found: ${threeCardWinnerCount}.`;
                    continue;
                }
            }
        }
    }
    return errors;
  }, [rounds, players, gameDetails.is3CardGame]);

  const hasErrors = Object.keys(roundErrors).length > 0;

  const handleSaveGame = () => {
    if (hasErrors) {
       toast({
        variant: "destructive",
        title: "Cannot Save Game",
        description: `Please fix the errors in the rounds before saving.`,
      });
      return;
    }
    // Make sure all rounds are complete before saving
    const incompleteRound = rounds.find(r => !r.isComplete && Object.values(r.scores).some(s => s !== 0));
    if (incompleteRound) {
      toast({
        variant: "destructive",
        title: "Incomplete Rounds",
        description: `Round ${incompleteRound.id} has scores but is not marked as complete. Please complete all rounds with data before saving.`,
      });
      return;
    }

    const newGameSession: Omit<GameSession, 'id'> = {
      ...gameDetails,
      players,
      rounds: rounds.filter(r => r.isComplete), // Only save completed rounds
      status: "Completed",
    };
    addGameSession(newGameSession);
    toast({
      title: "Game Saved",
      description: `The game "${gameDetails.teamName}" has been saved to your history.`,
    });
  };

  const handleAddRound = () => {
    if (hasErrors) {
      toast({
        variant: "destructive",
        title: "Invalid Round",
        description: `Cannot add a new round until all errors are fixed.`,
      });
      return;
    }
    addRound();
  };

  const handleToggleComplete = (roundId: number) => {
    toggleRoundCompletion(roundId);
  }

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
                onToggleComplete={handleToggleComplete}
                isOrganizer={isOrganizer}
                roundErrors={roundErrors}
            />
            {isOrganizer && (
              <div className="flex justify-center mt-4">
                <Button onClick={handleAddRound} variant="outline" disabled={hasErrors}>
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
