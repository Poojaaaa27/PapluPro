
"use client";

import { useMemo, useState } from "react";
import { useHistory } from "@/hooks/use-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { DateRangePicker } from "@/components/analytics/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { GameSession, Player, PlayerStatus, RoundOutcome } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, TrendingDown, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type OutcomeCounts = {
    [key in RoundOutcome | 'Wins']?: number;
};

interface PlayerStats extends OutcomeCounts {
    playerId: string;
    name: string;
    gamesPlayed: number;
    totalScore: number;
    winRate: number;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
};


export default function AnalyticsPage() {
    const { user } = useAuth();
    const { gameHistory } = useHistory();
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });
    const [location, setLocation] = useState<string>("all");
    const [selectedPlayer, setSelectedPlayer] = useState<string>("all");

    const uniqueLocations = useMemo(() => {
        const allLocations = gameHistory.map(game => game.location);
        return [...new Set(allLocations)];
    }, [gameHistory]);

    const uniquePlayers = useMemo(() => {
        const allPlayers = new Map<string, Player>();
        gameHistory.forEach(game => {
            game.players.forEach(player => {
                if (!allPlayers.has(player.id)) {
                    allPlayers.set(player.id, player);
                }
            })
        })
        return Array.from(allPlayers.values());
    }, [gameHistory])

    const filteredHistory = useMemo(() => {
        return gameHistory.filter(game => {
            const gameDate = new Date(game.date);
            const inDateRange = dateRange?.from && dateRange?.to ? 
                (gameDate >= dateRange.from && gameDate <= dateRange.to) : true;
            
            const inLocation = location === 'all' || game.location === location;

            const hasPlayer = selectedPlayer === 'all' || game.players.some(p => p.id === selectedPlayer);

            return inDateRange && inLocation && hasPlayer;
        });
    }, [gameHistory, dateRange, location, selectedPlayer]);


    const stats = useMemo(() => {
        const playerStatsMap = new Map<string, PlayerStats>();

        const initializePlayerStats = (player: Player): PlayerStats => ({
            playerId: player.id,
            name: player.name,
            gamesPlayed: 0,
            totalScore: 0,
            winRate: 0,
            Wins: 0,
            Scoot: 0,
            MidScoot: 0,
            Full: 0,
            Playing: 0,
        });

        filteredHistory.forEach(game => {
            const gamePlayerIds = new Set(game.players.map(p => p.id));
            
            // Initialize stats for all players in the game
            game.players.forEach(p => {
                if (!playerStatsMap.has(p.id)) {
                    playerStatsMap.set(p.id, initializePlayerStats(p));
                }
            });

            // Calculate total scores for this game to find winner(s)
            const gameScores: Record<string, number> = {};
            game.players.forEach(p => gameScores[p.id] = 0);
            game.rounds.forEach(round => {
                Object.entries(round.scores).forEach(([playerId, score]) => {
                    if (gameScores[playerId] !== undefined) {
                        gameScores[playerId] += score;
                    }
                });
            });

            const maxScore = Math.max(...Object.values(gameScores).filter(v => v !== undefined));
            const winners = Object.entries(gameScores).filter(([, score]) => score === maxScore && maxScore > 0).map(([id]) => id);

            game.players.forEach(player => {
                const stats = playerStatsMap.get(player.id);
                if (stats) {
                    stats.gamesPlayed += 1;
                    stats.totalScore += gameScores[player.id] || 0;
                    if (winners.includes(player.id)) {
                        stats.Wins = (stats.Wins || 0) + 1;
                    }

                    // Tally outcomes
                    game.rounds.forEach(round => {
                        const playerStatus: PlayerStatus = round.playerStatus[player.id];
                        if (playerStatus) {
                            const outcome = playerStatus.outcome === 'Winner' ? 'Wins' : playerStatus.outcome;
                            if (outcome !== 'Winner') { // Wins are already counted
                               stats[outcome] = (stats[outcome] || 0) + 1;
                            }
                        }
                    });
                }
            });
        });

        // Calculate win rate and finalize
        playerStatsMap.forEach(stats => {
            stats.winRate = stats.gamesPlayed > 0 ? Math.round((stats.Wins! / stats.gamesPlayed) * 100) : 0;
        });

        const sortedStats = Array.from(playerStatsMap.values()).sort((a, b) => b.totalScore - a.totalScore);
        
        const totalGames = filteredHistory.length;
        const totalPoints = sortedStats.reduce((sum, p) => sum + p.totalScore, 0);

        return {
            playerStats: sortedStats,
            totalGames,
            totalPoints,
        }

    }, [filteredHistory]);

    return (
        <div className="py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Game Analytics</h1>
                <p className="text-muted-foreground mt-1">Analyze your performance and track your progress.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Filters</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Date Range</Label>
                        <DateRangePicker date={dateRange} setDate={setDateRange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="location-filter">Location</Label>
                        <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger id="location-filter">
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                {uniqueLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="player-filter">Player</Label>
                        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                            <SelectTrigger id="player-filter">
                                <SelectValue placeholder="Select player" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Players</SelectItem>
                                {uniquePlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-headline">Total Games</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalGames}</div>
                        <p className="text-xs text-muted-foreground">in selected period</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-headline">Net Points</CardTitle>
                        {stats.totalPoints > 0 ? <TrendingUp className="h-4 w-4 text-green-500"/> : <TrendingDown className="h-4 w-4 text-red-500" />}
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", stats.totalPoints > 0 && "text-green-600", stats.totalPoints < 0 && "text-red-600")}>
                            {stats.totalPoints > 0 ? '+' : ''}{stats.totalPoints}
                        </div>
                        <p className="text-xs text-muted-foreground">Total points won/lost by {selectedPlayer === 'all' ? 'all players' : stats.playerStats.find(p => p.playerId === selectedPlayer)?.name}</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Player Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Rank</TableHead>
                                    <TableHead>Player</TableHead>
                                    <TableHead className="text-center">Wins</TableHead>
                                    <TableHead className="text-center">Win Rate</TableHead>
                                    <TableHead className="text-center">Scoots</TableHead>
                                    <TableHead className="text-center">Mid Scoots</TableHead>
                                    <TableHead className="text-center">Fulls</TableHead>
                                    <TableHead className="text-right">Total Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.playerStats.length > 0 ? stats.playerStats.map((playerStat, index) => (
                                    <TableRow key={playerStat.playerId} className={cn(playerStat.playerId === user?.name && "bg-muted/50")}>
                                        <TableCell className="font-bold text-lg text-center">{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={`https://avatar.vercel.sh/${playerStat.name}.png`} />
                                                    <AvatarFallback>{getInitials(playerStat.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="font-medium font-headline">{playerStat.name}</div>
                                                {index === 0 && playerStat.totalScore > 0 && <Crown className="w-5 h-5 text-amber-500" />}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{playerStat.Wins || 0}</TableCell>
                                        <TableCell className="text-center">{playerStat.winRate}%</TableCell>
                                        <TableCell className="text-center">{playerStat.Scoot || 0}</TableCell>
                                        <TableCell className="text-center">{playerStat.MidScoot || 0}</TableCell>
                                        <TableCell className="text-center">{playerStat.Full || 0}</TableCell>
                                        <TableCell className={cn("text-right font-bold", playerStat.totalScore > 0 && "text-green-600", playerStat.totalScore < 0 && "text-red-600")}>
                                            {playerStat.totalScore > 0 ? '+' : ''}{playerStat.totalScore}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No data for the selected filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
