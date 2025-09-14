"use client";

import { GameSetupForm } from "@/components/game/game-setup-form";
import { RoundsTable } from "@/components/game/rounds-table";
import { ScoresTable } from "@/components/game/scores-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import type { Player, GameRound } from "@/lib/types";
import { Save, Trash2 } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { calculateRoundScores } from "@/lib/score-parser";


const mockPlayers: Player[] = [
  { id: "1", name: "jo" },
  { id: "2", name: "so" },
  { id: "3", name: "fo" },
];

const mockRounds: GameRound[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  playerStatus: {},
  scores: {},
}));


export default function GamePage() {
  const { user } = useAuth();
  const isOrganizer = user?.role === 'organizer';

  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [rounds, setRounds] = useState<GameRound[]>(mockRounds);
  const [gameDetails, setGameDetails] = useState({
      location: "Chennai",
      teamName: "Team 1",
      date: "2025-08-12"
  });

  const handleStatusChange = useCallback((roundId: number, playerId: string, status: string) => {
    setRounds(prevRounds => {
      return prevRounds.map(r => {
        if (r.id === roundId) {
          const newPlayerStatus = { 
            ...r.playerStatus, 
            [playerId]: status
          };
          const newScores = calculateRoundScores(newPlayerStatus, players);
          // Create a new round object to ensure state update
          return {
            ...r,
            playerStatus: newPlayerStatus,
            scores: newScores,
          };
        }
        return r;
      });
    });
  }, [players]);


  const resetGame = () => {
    setRounds(Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      playerStatus: {},
      scores: {},
    })));
  }
  
  const totalScores = useMemo(() => {
    const totals: Record<string, number> = {};
    players.forEach(p => totals[p.id] = 0);
    rounds.forEach(round => {
      Object.entries(round.scores).forEach(([playerId, score]) => {
        if (totals[playerId] !== undefined) {
          totals[playerId] += score;
        }
      });
    });
    return totals;
  }, [rounds, players]);

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Game In Progress
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
          <TabsTrigger value="rounds" className="font-headline">Game</TabsTrigger>
          <TabsTrigger value="setup" className="font-headline">Setup</TabsTrigger>
        </TabsList>
        <TabsContent value="rounds" className="mt-6">
            <div className="space-y-8">
                <ScoresTable 
                    players={players} 
                    rounds={rounds}
                    totalScores={totalScores}
                />
                <RoundsTable 
                    players={players} 
                    rounds={rounds}
                    onStatusChange={handleStatusChange}
                    isOrganizer={isOrganizer}
                />
            </div>
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
