
"use client";

import { useMemo, useState, useEffect } from "react";
import { RoundsTable } from "@/components/game/rounds-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useGame } from "@/hooks/use-game";
import { Save, Trash2, PlusCircle, CheckCircle } from "lucide-react";
import { useHistory } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";
import type { GameSession } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Gamepad2 } from "lucide-react";

export default function GamePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { 
    players, 
    rounds, 
    gameDetails, 
    handleStatusChange,
    toggleRoundCompletion,
    resetGame,
    addRound,
  } = useGame();
  const { addGameSession } = useHistory();
  const { toast } = useToast();
  
  const [roundErrors, setRoundErrors] = useState<Record<number, string>>({});

  const isOrganizer = user?.role === 'organizer';

  const currentRound = useMemo(() => {
    return rounds.find(r => !r.isComplete);
  }, [rounds]);

  // Real-time validation for the current round
  useEffect(() => {
    if (!currentRound) return;

    const newErrors: Record<number, string> = {};
    const round = currentRound;
    let errorFound = false;

    // Paplu count validation
    if (gameDetails.is3CardGame) {
      const totalPapluInRound = Object.values(round.playerStatus).reduce((sum, status) => sum + (status?.papluCount || 0), 0);
      if (totalPapluInRound > 3) {
        newErrors[round.id] = `Too many paplus (max 3)`;
        errorFound = true;
      }
    }

    // Winner (D) count validation
    if (!errorFound) {
      const winnerCount = Object.values(round.playerStatus).filter(s => s?.outcome === 'Winner').length;
      if (winnerCount > 1) {
          newErrors[round.id] = `Must have only 1 winner (D)`;
          errorFound = true;
      }
    }
    
    // 3C winner count validation
    if (!errorFound && gameDetails.is3CardGame) {
        const threeCardWinnerCount = Object.values(round.playerStatus).filter(s => s?.is3C).length;
        if (threeCardWinnerCount > 1) {
            newErrors[round.id] = `Must have only 1 3C winner`;
            errorFound = true;
        }
    }
    
    setRoundErrors(newErrors);
  }, [currentRound, rounds, gameDetails.is3CardGame]); // Depend on rounds to catch status changes

  const handleSaveGame = () => {
    const completedRounds = rounds.filter(r => r.isComplete);
    if (completedRounds.length === 0) {
      toast({
        variant: "destructive",
        title: "No Completed Rounds",
        description: `Complete at least one round before saving the game.`,
      });
      return;
    }

    const newGameSession: Omit<GameSession, 'id'> = {
      ...gameDetails,
      players,
      rounds: completedRounds,
      status: "Completed",
    };
    addGameSession(newGameSession);
    toast({
      title: "Game Saved",
      description: `The game "${gameDetails.teamName}" has been saved to your history.`,
    });
    router.push('/history');
  };
  
  const handleToggleComplete = (roundId: number) => {
    const round = rounds.find(r => r.id === roundId);
    if (!round) return;

    let newErrors = { ...roundErrors };
    
    // Clear previous error for this round before re-validating
    delete newErrors[roundId];

    // --- VALIDATION RULES ---

    // 1. Check for exactly one winner
    const winnerCount = Object.values(round.playerStatus).filter(s => s?.outcome === 'Winner').length;
    if (winnerCount !== 1) {
        newErrors[roundId] = `Must have exactly 1 winner (D)`;
        setRoundErrors(newErrors);
        return;
    }
    
    // 2. If it's a 3-card game, check for exactly one 3C winner
    if (gameDetails.is3CardGame) {
        const threeCardWinnerCount = Object.values(round.playerStatus).filter(s => s?.is3C).length;
        if (threeCardWinnerCount > 1) {
            newErrors[roundId] = `Must have only 1 3C winner`;
            setRoundErrors(newErrors);
            return;
        }
        if (threeCardWinnerCount < 1) {
            newErrors[roundId] = `Must have exactly 1 3C winner`;
            setRoundErrors(newErrors);
            return;
        }
    }
    
    // 3. Check Paplu count if it's a 3-card game
    if (gameDetails.is3CardGame) {
      const totalPapluInRound = Object.values(round.playerStatus).reduce((sum, status) => sum + (status?.papluCount || 0), 0);
      if (totalPapluInRound > 3) {
        newErrors[round.id] = `Too many paplus (max 3)`;
        setRoundErrors(newErrors);
        return;
      }
    }

    // 4. Check if every player has either an outcome or points
    const incompletePlayer = players.find(p => {
        const status = round.playerStatus[p.id];
        if (!status) return true; // Should not happen, but defensive
        // A player is incomplete if they are 'Playing' but have no points entered.
        return status.outcome === 'Playing' && (status.points === null || status.points === undefined);
    });

    if (incompletePlayer) {
        newErrors[roundId] = `All players must have points or an outcome (F, S, MS)`;
        setRoundErrors(newErrors);
        return;
    }

    // --- END VALIDATION ---


    // If validation passes, clear errors for this round and toggle
    setRoundErrors(newErrors);
    if (isOrganizer) {
      toggleRoundCompletion(roundId);
    }
    router.push('/scores');
  }

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            {currentRound ? `Current Round: ${currentRound.id}` : "Game Complete"}
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

      {currentRound ? (
        <RoundsTable 
            rounds={[currentRound]}
            players={players}
            onStatusChange={handleStatusChange}
            onToggleComplete={handleToggleComplete}
            isOrganizer={isOrganizer}
            roundErrors={roundErrors}
            is3CardGame={gameDetails.is3CardGame}
        />
      ) : (
        <Alert>
            <Gamepad2 className="h-4 w-4" />
            <AlertTitle className="font-headline">All Rounds Complete!</AlertTitle>
            <AlertDescription>
                You've finished all the rounds. You can now save the game to your history, or add another round.
            </AlertDescription>
            <div className="flex gap-4 mt-4">
                <Button onClick={handleSaveGame}><Save /> Save Game</Button>
                 {isOrganizer && (
                    <Button onClick={addRound} variant="outline">
                        <PlusCircle />
                        Add Another Round
                    </Button>
                 )}
            </div>
        </Alert>
      )}

    </div>
  );
}
