
"use client";

import type { User, UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { createContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("paplu-pro-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("paplu-pro-user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    const userWithId = { ...userData, id: userData.name }; // Use name as a simple ID
    try {
      localStorage.setItem("paplu-pro-user", JSON.stringify(userWithId));
    } catch (error) {
        console.error("Failed to save user to localStorage", error);
    }
    setUser(userWithId);
  };

  const logout = () => {
    try {
      localStorage.removeItem("paplu-pro-user");
    } catch (error) {
        console.error("Failed to remove user from localStorage", error);
    }
    setUser(null);
    router.push("/");
  };

  const isAuthenticated = !loading && user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
