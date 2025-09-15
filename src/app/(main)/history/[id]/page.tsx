
"use client";

import { useHistory } from "@/hooks/use-history";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import type { GameSession } from "@/lib/types";
import { ScoresTable } from "@/components/game/scores-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function GameHistoryDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { gameHistory, loading: historyLoading } = useHistory();
    const [gameSession, setGameSession] = useState<GameSession | null>(null);

    const gameId = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        if (!historyLoading && gameId) {
            const session = gameHistory.find(g => g.id === gameId);
            if (session) {
                setGameSession(session);
            } else {
                // Optional: redirect if game not found
                // router.push('/history');
            }
        }
    }, [gameId, gameHistory, historyLoading, router]);

    const totalScores = useMemo(() => {
        if (!gameSession) return {};
        const totals: Record<string, number> = {};
        gameSession.players.forEach(p => totals[p.id] = 0);
        gameSession.rounds.forEach(round => {
            Object.entries(round.scores).forEach(([playerId, score]) => {
                if (totals[playerId] !== undefined) {
                    totals[playerId] += score;
                }
            });
        });
        return totals;
    }, [gameSession]);

    if (historyLoading || !gameSession) {
        return (
            <div className="py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="h-10 w-24" />
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    const gameDate = new Date(gameSession.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="py-8">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-headline tracking-tight">
                            {gameSession.teamName}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {gameSession.location} &bull; {gameDate}
                        </p>
                    </div>
                </div>
            </div>
            <ScoresTable
                players={gameSession.players}
                rounds={gameSession.rounds}
                totalScores={totalScores}
            />
        </div>
    );
}
