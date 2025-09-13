"use client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { GameRound, Player } from "@/lib/types";
import { useMemo } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Crown, TrendingDown, TrendingUp } from "lucide-react";

interface LeaderboardTableProps {
    players: Player[];
    rounds: GameRound[];
}

export function LeaderboardTable({ players, rounds }: LeaderboardTableProps) {
    
    const leaderboardData = useMemo(() => {
        const scores = players.map(player => {
            const totalScore = rounds.reduce((acc, round) => acc + (round.scores[player.id] || 0), 0);
            return { ...player, totalScore };
        });
        return scores.sort((a, b) => b.totalScore - a.totalScore);
    }, [players, rounds]);
    
    const playerImages = PlaceHolderImages.filter(p => p.id.startsWith('card-player'));
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Leaderboard</CardTitle>
                <CardDescription>Current scores and rankings for this game.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Rank</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead className="text-right">Total Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboardData.map((player, index) => (
                            <TableRow key={player.id} className={index === 0 ? "bg-secondary/50" : ""}>
                                <TableCell className="font-medium text-lg">
                                    <div className="flex items-center gap-2">
                                        {index + 1}
                                        {index === 0 && <Crown className="w-5 h-5 text-amber-500" />}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={playerImages[index % playerImages.length]?.imageUrl} data-ai-hint="person portrait" />
                                            <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{player.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2 font-bold text-lg">
                                        {player.totalScore > 0 ? 
                                            <TrendingUp className="w-4 h-4 text-green-600"/> :
                                            player.totalScore < 0 ?
                                            <TrendingDown className="w-4 h-4 text-red-600"/> : null
                                        }
                                        <span className={player.totalScore > 0 ? 'text-green-600' : player.totalScore < 0 ? 'text-red-600' : ''}>
                                            {player.totalScore}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
