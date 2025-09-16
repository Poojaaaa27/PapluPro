"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeams } from '@/hooks/use-teams';
import type { Team, Player } from '@/lib/types';
import { Trash2, UserPlus } from 'lucide-react';

interface TeamEditDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  team: Team | null;
}

export function TeamEditDialog({ isOpen, setIsOpen, team }: TeamEditDialogProps) {
  const { addTeam, updateTeam } = useTeams();
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  useEffect(() => {
    if (isOpen && team) {
      setTeamName(team.name);
      setPlayers(team.players);
    } else if (isOpen && !team) {
      // Reset for new team
      setTeamName('');
      setPlayers([]);
    }
  }, [isOpen, team]);

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        id: `${Date.now()}-${Math.random()}`,
        name: newPlayerName.trim(),
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
    }
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleSave = () => {
    if (!teamName.trim()) return;

    if (team) {
      // Update existing team
      updateTeam(team.id, { name: teamName, players });
    } else {
      // Add new team
      addTeam({ name: teamName, players });
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{team ? 'Edit Team' : 'Add New Team'}</DialogTitle>
          <DialogDescription>
            {team ? `Editing the "${team.name}" team.` : 'Create a new team to use in your games.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="team-name" className="font-headline">
              Team Name
            </Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g., The Champions"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-headline">Players</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {players.map((player) => (
                    <div key={player.id} className="flex items-center gap-2">
                        <Input value={player.name} readOnly className="bg-muted" />
                        <Button variant="ghost" size="icon" onClick={() => handleRemovePlayer(player.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>
          </div>
           <div className="space-y-2">
                <Label htmlFor="new-player" className="font-headline">Add Player</Label>
                <div className="flex items-center gap-2">
                    <Input 
                        id="new-player"
                        value={newPlayerName} 
                        onChange={(e) => setNewPlayerName(e.target.value)} 
                        placeholder="New player name" 
                        onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    />
                    <Button onClick={handleAddPlayer}><UserPlus className="mr-2 h-4 w-4" /> Add</Button>
                </div>
           </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Team</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
