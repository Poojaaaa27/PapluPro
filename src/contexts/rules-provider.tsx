
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import type { GameRules } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

const DEFAULT_RULES: GameRules = {
  threeCardHand: 10,
  scoot: 10,
  midScoot: 20,
  full: 40,
  perPoint: 1,
  singlePaplu: 10,
  doublePaplu: 30,
  triplePaplu: 50,
};

interface RulesContextType {
  rules: GameRules;
  setRules: React.Dispatch<React.SetStateAction<GameRules>>;
  isOrganizer: boolean;
}

export const RulesContext = createContext<RulesContextType | undefined>(undefined);

export function RulesProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<GameRules>(DEFAULT_RULES);
  const { user } = useAuth();
  const isOrganizer = user?.role === 'organizer';

  useEffect(() => {
    try {
      const storedRules = localStorage.getItem("paplu-pro-rules");
      if (storedRules) {
        setRules(JSON.parse(storedRules));
      }
    } catch (error) {
      console.error("Failed to parse rules from localStorage", error);
      localStorage.removeItem("paplu-pro-rules");
    }
  }, []);

  useEffect(() => {
    // Only organizers can save rules
    if(isOrganizer) {
        try {
            localStorage.setItem("paplu-pro-rules", JSON.stringify(rules));
        } catch (error) {
            console.error("Failed to save rules to localStorage", error);
        }
    }
  }, [rules, isOrganizer]);

  return (
    <RulesContext.Provider value={{ rules, setRules, isOrganizer }}>
      {children}
    </RulesContext.Provider>
  );
}
