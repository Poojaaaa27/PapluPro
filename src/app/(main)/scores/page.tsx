
"use client";

import { ScoresTable } from "@/components/game/scores-table";
import { RoundsTable } from "@/components/game/rounds-table";
import { useGame } from "@/hooks/use-game";
import { useMemo } from "react";

export default function ScoresPage() {
    const { players, rounds, totalScores } = useGame();

    const completedRounds = useMemo(() => rounds.filter(r => r.isComplete), [rounds]);

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
                rounds={rounds} // Keep passing all rounds for total score calculation
                totalScores={totalScores}
            />
            <div>
                 <h2 className="text-2xl font-bold font-headline tracking-tight mb-4">
                    Completed Rounds
                </h2>
                <RoundsTable 
                    players={players}
                    rounds={completedRounds}
                    onStatusChange={() => {}}
                    onToggleComplete={() => {}}
                    isOrganizer={false} // Make it read-only
                />
            </div>
        </div>
    )
}
