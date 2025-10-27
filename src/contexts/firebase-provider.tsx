"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { firebaseConfig } from "@/lib/firebase-config";

interface FirebaseContextType {
  app: FirebaseApp;
}

export const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [app, setApp] = useState<FirebaseApp | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const apps = getApps();
      const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
      setApp(app);
    }
  }, []);

  if (!app) {
    return <div>Loading Firebase...</div>; // Or a proper loader
  }

  return (
    <FirebaseContext.Provider value={{ app }}>
      {children}
    </FirebaseContext.Provider>
  );
}
