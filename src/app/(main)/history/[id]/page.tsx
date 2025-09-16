
"use client";

import { useHistory } from "@/hooks/use-history";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import type { GameSession, Player } from "@/lib/types";
import { ScoresTable } from "@/components/game/scores-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RoundsTable } from "@/components/game/rounds-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
                // Temporary migration for old data format
                const migratedSession = {
                    ...session,
                    rounds: session.rounds.map(r => ({
                        ...r,
                        playerStatus: r.playerStatus || {}
                    }))
                };
                setGameSession(migratedSession);
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

    const sortedPlayers = useMemo(() => {
        if (!gameSession) return [];
        return gameSession.players
            .map(player => ({
                ...player,
                score: totalScores[player.id] || 0,
            }))
            .sort((a, b) => b.score - a.score);
    }, [gameSession, totalScores]);

    const winningScore = sortedPlayers.length > 0 ? sortedPlayers[0].score : 0;
    
    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return names[0][0] + names[names.length - 1][0];
        }
        return name.substring(0, 2);
    }

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
        <div className="py-8 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
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

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Final Standings</CardTitle>
                    <CardDescription>The leaderboard for this game session.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sortedPlayers.map((player, index) => {
                            const isWinner = player.score === winningScore && winningScore > 0;
                            return (
                                <div key={player.id} className={cn("flex items-center justify-between p-3 rounded-lg", isWinner ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted/50")}>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={`https://avatar.vercel.sh/${player.name}.png`} alt={player.name} />
                                            <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold font-headline text-lg">{player.name}</p>
                                            {isWinner && <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1"><Crown className="w-4 h-4" /> Winner</p>}
                                        </div>
                                    </div>
                                    <div className={cn("text-2xl font-bold", player.score > 0 && "text-green-600", player.score < 0 && "text-red-600")}>
                                        {player.score}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Game Sheet</CardTitle>
                </CardHeader>
                <CardContent>
                    <RoundsTable
                        players={gameSession.players}
                        rounds={gameSession.rounds}
                        onStatusChange={() => {}} // Read-only, so no-op
                        isOrganizer={false} // Force read-only view
                    />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Final Scores</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScoresTable
                        players={gameSession.players}
                        rounds={gameSession.rounds}
                        totalScores={totalScores}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
