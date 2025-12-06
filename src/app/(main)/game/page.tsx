
"use client";

import { useMemo, useState, useEffect } from "react";
import { RoundsTable } from "@/components/game/rounds-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useGame } from "@/hooks/use-game";
import { Save, Trash2, PlusCircle, XCircle, RotateCcw, UserPlus } from "lucide-react";
import { useHistory } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";
import type { GameSession, Player } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    cancelRound,
    isRoundCanceled,
    addPlayer,
  } = useGame();
  const { addGameSession } = useHistory();
  const { toast } = useToast();
  
  const [roundErrors, setRoundErrors] = useState<Record<number, string>>({});
  const [newPlayerName, setNewPlayerName] = useState('');

  const isOrganizer = user?.role === 'organizer';

  const currentRound = useMemo(() => {
    return rounds.find(r => !r.isComplete);
  }, [rounds]);

  // Real-time validation for the current round
  useEffect(() => {
    if (!currentRound) return;

    // Don't validate a canceled round
    if (isRoundCanceled(currentRound.id)) {
      setRoundErrors({});
      return;
    }

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
  }, [currentRound, rounds, gameDetails.is3CardGame, isRoundCanceled]); // Depend on rounds to catch status changes

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && isOrganizer) {
      const existingPlayer = players.find(p => p.name.toLowerCase() === newPlayerName.trim().toLowerCase());
      if (existingPlayer) {
        toast({
          variant: "destructive",
          title: "Player Exists",
          description: `A player named "${newPlayerName}" is already in the game.`,
        });
        return;
      }
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
      toast({
        title: "Player Added",
        description: `"${newPlayerName}" has joined the game.`,
      });
    }
  };

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
    setRoundErrors(newErrors); // Clear immediately for better UX

    // If the round is canceled, handle its specific completion logic
    if (isRoundCanceled(roundId)) {
        if (gameDetails.is3CardGame) {
            const threeCardWinnerCount = Object.values(round.playerStatus).filter(s => s?.is3C).length;
            if (threeCardWinnerCount !== 1) {
                setRoundErrors(prev => ({
                    ...prev,
                    [roundId]: "A canceled 3C game must have one 3C winner to complete."
                }));
                return;
            }
        }
        
        if (isOrganizer) {
          toggleRoundCompletion(roundId);
        }
        router.push('/scores');
        return;
    }


    // --- VALIDATION RULES FOR NORMAL ROUNDS ---

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
        // Only check players who are actually part of this round
        if (!round.playerStatus[p.id]) return false;

        const status = round.playerStatus[p.id];
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

  const handleCancelClick = () => {
    if (currentRound) {
        cancelRound(currentRound.id);
    }
  }

  const isCurrentRoundCanceled = currentRound ? isRoundCanceled(currentRound.id) : false;

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            {currentRound ? `Current Round: ${currentRound.id}` : "Game Complete"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {gameDetails.teamName} at {gameDetails.location} | Players: {players.length} | Date: {gameDetails.date}
          </p>
        </div>
        {isOrganizer && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleSaveGame}><Save /> Save Game</Button>
            <Button variant="destructive" onClick={resetGame}><Trash2 /> Reset</Button>
            {currentRound && 
              <Button 
                variant={isCurrentRoundCanceled ? "destructive" : "secondary"} 
                onClick={handleCancelClick}
                className={cn(isCurrentRoundCanceled && "bg-amber-600 hover:bg-amber-700 text-white")}
              >
                {isCurrentRoundCanceled ? <RotateCcw /> : <XCircle />}
                {isCurrentRoundCanceled ? "Undo Cancel" : "Cancel Round"}
              </Button>
            }
          </div>
        )}
      </div>

      {isOrganizer && currentRound && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Add Player Mid-Game</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
                <Label htmlFor="new-player-name" className="sr-only">Player Name</Label>
                <Input 
                  id="new-player-name"
                  value={newPlayerName} 
                  onChange={(e) => setNewPlayerName(e.target.value)} 
                  placeholder="Enter new player's name" 
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                />
                <Button onClick={handleAddPlayer}><UserPlus /> Add</Button>
              </div>
          </CardContent>
        </Card>
      )}

      {currentRound ? (
        <RoundsTable 
            rounds={[currentRound]}
            players={players}
            onStatusChange={handleStatusChange}
            onToggleComplete={handleToggleComplete}
            isOrganizer={isOrganizer}
            roundErrors={roundErrors}
            is3CardGame={gameDetails.is3CardGame}
            isCanceled={isCurrentRoundCanceled}
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

    