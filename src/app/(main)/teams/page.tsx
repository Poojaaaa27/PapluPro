
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeams } from "@/hooks/use-teams";
import { PlusCircle, Users, Trash2, Edit, Play } from "lucide-react";
import { TeamEditDialog } from '@/components/teams/team-edit-dialog';
import type { Team } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { GameSetupForm } from '@/components/game/game-setup-form';
import { useGame } from '@/hooks/use-game';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function TeamsPage() {
    const { user } = useAuth();
    const { teams, deleteTeam, loading } = useTeams();
    const { players, updatePlayers, gameDetails, setGameDetails } = useGame();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const router = useRouter();

    const isOrganizer = user?.role === 'organizer';

    const handleAddNew = () => {
        setSelectedTeam(null);
        setDialogOpen(true);
    }

    const handleEdit = (team: Team) => {
        setSelectedTeam(team);
        setDialogOpen(true);
    }
    
    const handlePlayWithTeam = (team: Team) => {
        setGameDetails(prev => ({...prev, teamName: team.name}));
        updatePlayers(team.players);
        router.push('/game');
    }

    return (
        <div className="py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">
                        Game Setup
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Configure your game, manage teams, and start playing.
                    </p>
                </div>
                {isOrganizer && (
                    <Button onClick={handleAddNew} className="w-full md:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Team
                    </Button>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                         <CardHeader>
                            <CardTitle className="font-headline">Current Game</CardTitle>
                            <CardDescription>Start a game with manually added players or select a team.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GameSetupForm
                                players={players}
                                setPlayers={updatePlayers}
                                gameDetails={gameDetails}
                                setGameDetails={setGameDetails}
                                isOrganizer={isOrganizer}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Saved Teams</CardTitle>
                            <CardDescription>Select a team to quickly start a game or manage your saved teams.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p>Loading teams...</p>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                                    {teams.map(team => (
                                        <Card key={team.id} className="flex flex-col">
                                            <CardHeader>
                                                <CardTitle className="font-headline flex items-center justify-between">
                                                    {team.name}
                                                    <div className="flex items-center gap-1">
                                                        {isOrganizer &&
                                                            <>
                                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(team)}>
                                                                    <Edit className="h-5 w-5" />
                                                                </Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon">
                                                                            <Trash2 className="h-5 w-5 text-destructive" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This action cannot be undone. This will permanently delete the team "{team.name}".
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => deleteTeam(team.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </>
                                                        }
                                                    </div>
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" /> {team.players.length} players
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <ul className="space-y-2">
                                                    {team.players.map(player => (
                                                        <li key={player.id} className="text-sm font-bold bg-muted/50 p-2 rounded-md">{player.name}</li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                            {isOrganizer && 
                                                <CardContent>
                                                    <Button className="w-full" onClick={() => handlePlayWithTeam(team)}>
                                                        <Play /> Play with this team
                                                    </Button>
                                                </CardContent>
                                            }
                                        </Card>
                                    ))}
                                    {isOrganizer &&
                                        <Card 
                                            className="flex flex-col items-center justify-center border-2 border-dashed bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer min-h-[200px]"
                                            onClick={handleAddNew}
                                        >
                                            <CardContent className="text-center p-6">
                                                <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                                                <p className="mt-4 font-semibold text-muted-foreground font-headline">Add New Team</p>
                                            </CardContent>
                                        </Card>
                                    }
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            {isOrganizer && 
                <TeamEditDialog 
                    isOpen={dialogOpen}
                    setIsOpen={setDialogOpen}
                    team={selectedTeam}
                />
            }
        </div>
    );
}
