"use client";

import { ScoresTable } from "@/components/game/scores-table";
import { useGame } from "@/hooks/use-game";

export default function ScoresPage() {
    const { players, rounds, totalScores } = useGame();

    return (
        <div className="py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                    Scoresheet
                </h1>
                <p className="text-muted-foreground mt-1">
                    A detailed breakdown of the current game's scores.
                </p>
            </div>
            <ScoresTable 
                players={players} 
                rounds={rounds}
                totalScores={totalScores}
            />
        </div>
    )
}
