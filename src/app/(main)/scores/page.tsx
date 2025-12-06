
"use client";

import { ScoresTable } from "@/components/game/scores-table";
import { RoundsTable } from "@/components/game/rounds-table";
import { useGame } from "@/hooks/use-game";
import { useMemo } from "react";
import { useRules } from "@/hooks/use-rules";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function ScoresPage() {
    const { players, rounds, totalScores, handleStatusChange, toggleRoundCompletion, gameDetails, addRound } = useGame();
    const { isOrganizer } = useRules();
    const router = useRouter();

    const completedRounds = useMemo(() => rounds.filter(r => r.isComplete), [rounds]);

    const handleEditRound = (roundId: number) => {
        // Find the round in the completed list
        const roundToEdit = completedRounds.find(r => r.id === roundId);
        if (roundToEdit && isOrganizer) {
            // This will mark it as incomplete, moving it back to the game page
            toggleRoundCompletion(roundId);
            router.push('/game');
        }
    }

    return (
        <div className="py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                    Result
                </h1>
                <p className="text-muted-foreground mt-1">
                    Live totals and a detailed breakdown of completed rounds.
                </p>
            </div>
            <ScoresTable 
                players={players} 
                rounds={rounds}
                totalScores={totalScores}
            />
            <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-headline tracking-tight">
                        Completed Rounds
                    </h2>
                    {isOrganizer && (
                        <Link href="/game">
                            <Button onClick={addRound} variant="outline">
                                <PlusCircle />
                                Add New Round
                            </Button>
                        </Link>
                    )}
                </div>
                <RoundsTable 
                    players={players}
                    rounds={completedRounds}
                    onStatusChange={handleStatusChange}
                    onToggleComplete={handleEditRound}
                    isOrganizer={isOrganizer}
                    is3CardGame={gameDetails.is3CardGame}
                />
            </div>
        </div>
    )
}
