"use client";

import { Button } from "@/components/ui/button";
import { HistoryTable } from "@/components/history/history-table";
import { Download } from "lucide-react";
import { useHistory } from "@/hooks/use-history";

export default function HistoryPage() {
  const { gameHistory } = useHistory();

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
      <HistoryTable data={gameHistory} />
    </div>
  );
}
