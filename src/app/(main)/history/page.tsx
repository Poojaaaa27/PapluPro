"use client";

import { Button } from "@/components/ui/button";
import { HistoryTable } from "@/components/history/history-table";
import { Download } from "lucide-react";
import { useHistory } from "@/hooks/use-history";
import type { GameSession } from "@/lib/types";

export default function HistoryPage() {
  const { gameHistory } = useHistory();

  const exportAllToCSV = () => {
    let allCsvContent = "";

    gameHistory.forEach((game, index) => {
      // Add game title
      allCsvContent += `Game: ${game.teamName}\n`;
      allCsvContent += `Location: ${game.location}\n`;
      allCsvContent += `Date: ${new Date(game.date).toLocaleDateString()}\n\n`;

      const headers = ['Round', ...game.players.map(p => p.name), 'Round Total'];
      const rows = game.rounds.map(round => {
        const roundTotal = Object.values(round.scores).reduce((sum, score) => sum + score, 0);
        const hasScores = Object.values(round.scores).some(score => score !== 0);
        const playerScores = game.players.map(p => hasScores ? (round.scores[p.id] || 0) : '');
        return [round.id, ...playerScores, hasScores ? roundTotal : ''];
      });

      const totalScores = game.players.map(p => {
          return game.rounds.reduce((total, round) => total + (round.scores[p.id] || 0), 0);
      });
      const grandTotal = totalScores.reduce((sum, score) => sum + score, 0);
      const footer = ['Total', ...totalScores, grandTotal];

      allCsvContent += [
        headers.join(','),
        ...rows.map(row => row.join(',')),
        footer.join(',')
      ].join('\n');
      
      // Add spacing between games, but not after the last one
      if (index < gameHistory.length - 1) {
        allCsvContent += "\n\n\n";
      }
    });


    const blob = new Blob([allCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `paplu_pro_all_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Game History
          </h1>
          <p className="text-muted-foreground mt-1">
            Review past games, scores, and glorious moments.
          </p>
        </div>
        <Button onClick={exportAllToCSV} disabled={gameHistory.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>
      <HistoryTable data={gameHistory} />
    </div>
  );
}
