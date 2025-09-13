import { Button } from "@/components/ui/button";
import { HistoryTable } from "@/components/history/history-table";
import { Download } from "lucide-react";
import type { GameSession } from "@/lib/types";

const mockHistory: GameSession[] = [
    { id: 'game-1', location: "Alice's House", date: "2023-10-15", teamName: "The Sharks", status: "Completed", players: [{id: '1', name: 'Alice'}, {id: '2', name: 'Bob'}], rounds: [] },
    { id: 'game-2', location: "Community Center", date: "2023-10-22", teamName: "The Jets", status: "Completed", players: [{id: '1', name: 'Charlie'}, {id: '2', name: 'Diana'}], rounds: [] },
    { id: 'game-3', location: "The Den", date: "2023-11-01", teamName: "High Rollers", status: "Completed", players: [{id: '1', name: 'Alice'}, {id: '2', name: 'Charlie'}], rounds: [] },
    { id: 'game-4', location: "Bob's Cafe", date: "2023-11-05", teamName: "The Aces", status: "In Progress", players: [{id: '1', name: 'Bob'}, {id: '2', name: 'Diana'}], rounds: [] },
];

export default function HistoryPage() {
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
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>
      <HistoryTable data={mockHistory} />
    </div>
  );
}
