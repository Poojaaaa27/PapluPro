"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { GameProvider } from '@/contexts/game-provider';
import { RulesProvider } from '@/contexts/rules-provider';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </header>
        <main className="flex-1 container max-w-screen-2xl p-4 md:p-8">
            <Skeleton className="h-48 w-full" />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </main>
      </div>
    );
  }

  return (
    <RulesProvider>
      <GameProvider>
          <div className="relative flex min-h-screen w-full flex-col items-center">
          <Header />
          <main className="flex-1 w-full container max-w-screen-2xl">
              {children}
          </main>
          </div>
      </GameProvider>
    </RulesProvider>
  );
}
