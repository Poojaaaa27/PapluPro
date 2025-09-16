"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeams } from "@/hooks/use-teams";
import { PlusCircle, Users, Trash2, Edit } from "lucide-react";
import { TeamEditDialog } from '@/components/teams/team-edit-dialog';
import type { Team } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function TeamsPage() {
    const { teams, deleteTeam, loading } = useTeams();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    const handleAddNew = () => {
        setSelectedTeam(null);
        setDialogOpen(true);
    }

    const handleEdit = (team: Team) => {
        setSelectedTeam(team);
        setDialogOpen(true);
    }

    return (
        <div className="py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">
                        Manage Teams
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Create, edit, and delete your player teams.
                    </p>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Team
                </Button>
            </div>

            {loading ? (
                <p>Loading teams...</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map(team => (
                        <Card key={team.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center justify-between">
                                    {team.name}
                                    <div className="flex items-center gap-2">
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
                                    </div>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <Users className="h-4 w-4" /> {team.players.length} players
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-2">
                                    {team.players.map(player => (
                                        <li key={player.id} className="text-sm bg-muted/50 p-2 rounded-md">{player.name}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                     <Card 
                        className="flex flex-col items-center justify-center border-2 border-dashed bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer"
                        onClick={handleAddNew}
                    >
                        <CardContent className="text-center p-6">
                            <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 font-semibold text-muted-foreground font-headline">Add New Team</p>
                        </CardContent>
                    </Card>
                </div>
            )}
            
            <TeamEditDialog 
                isOpen={dialogOpen}
                setIsOpen={setDialogOpen}
                team={selectedTeam}
            />
        </div>
    );
}
