
"use client";

import { useMemo, useState, useEffect } from "react";
import { RoundsTable } from "@/components/game/rounds-table";
import { GameSetupForm } from "@/components/game/game-setup-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useGame } from "@/hooks/use-game";
import { Save, Trash2, PlusCircle } from "lucide-react";
import { useHistory } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";
import type { GameSession, GameRound } from "@/lib/types";

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
  
  const [roundErrors, setRoundErrors] = useState<Record<number, string>>({});

  const isOrganizer = user?.role === 'organizer';

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<number, string> = {};
    rounds.forEach(round => {
      // Paplu count validation
      const totalPapluInRound = Object.values(round.playerStatus).reduce((sum, status) => sum + (status?.papluCount || 0), 0);
      if (totalPapluInRound > 3) {
        newErrors[round.id] = `Too many paplus (max 3)`;
      }

      // Carry over other errors that are only checked on completion
      if (roundErrors[round.id] && !newErrors[round.id] && round.isComplete === false) {
          const isPapluError = roundErrors[round.id]?.includes('paplus');
          if (!isPapluError) {
             newErrors[round.id] = roundErrors[round.id];
          }
      }
    });
    setRoundErrors(newErrors);
  }, [rounds]);

  const handleSaveGame = () => {
    // Check for any incomplete rounds with data
    const incompleteRoundsWithData = rounds.filter(
      r => !r.isComplete && Object.values(r.scores).some(s => s !== 0)
    );

    if (incompleteRoundsWithData.length > 0) {
      toast({
        variant: "destructive",
        title: "Incomplete Rounds",
        description: `Please complete all rounds with scores before saving (e.g., Round ${incompleteRoundsWithData[0].id}).`,
      });
      return;
    }
    
    // Check for any errors
    if(Object.keys(roundErrors).length > 0) {
      toast({
        variant: "destructive",
        title: "Errors in Rounds",
        description: `Please fix the errors in the highlighted rounds before saving.`,
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
    if (Object.keys(roundErrors).length > 0) return;
    addRound();
  };
  
  const handleToggleComplete = (roundId: number) => {
    const round = rounds.find(r => r.id === roundId);
    if (!round) return;

    let newErrors = { ...roundErrors };

    // If we are trying to complete the round, run validation.
    if (!round.isComplete) {
      const winnerCount = Object.values(round.playerStatus).filter(s => s?.outcome === 'Winner').length;
      if (winnerCount !== 1) {
          newErrors[roundId] = `Must have 1 winner (D)`;
          setRoundErrors(newErrors);
          return;
      }
      
      if (gameDetails.is3CardGame) {
          const threeCardWinnerCount = Object.values(round.playerStatus).filter(s => s?.is3C).length;
          if (threeCardWinnerCount !== 1) {
              newErrors[roundId] = `Must have 1 3C winner`;
              setRoundErrors(newErrors);
              return;
          }
      }
    }

    // If validation passes (or we are de-completing), clear errors for this round and toggle
    delete newErrors[roundId];
    setRoundErrors(newErrors);
    toggleRoundCompletion(roundId);
  }

  const hasErrors = Object.keys(roundErrors).length > 0;

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
