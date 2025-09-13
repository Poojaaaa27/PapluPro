"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Gamepad2, History, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useAuth();
  const heroImage = PlaceHolderImages.find(p => p.id === 'dashboard-hero');

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          Welcome back, {user?.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Ready to shuffle up and deal? Here's your game overview.
        </p>
      </div>

      {heroImage && <div className="relative rounded-lg overflow-hidden mb-8 h-48 md:h-64">
        <Image 
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          data-ai-hint={heroImage.imageHint}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold font-headline text-primary-foreground">Start a New Match</h2>
            <p className="text-primary-foreground/80 mt-1 max-w-lg">Set up players, teams, and scoring rules in just a few clicks.</p>
        </div>
      </div>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Total Games</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Wins</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">66% win rate</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Active Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">in your main group</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Last Game Score</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+250</div>
            <p className="text-xs text-muted-foreground">vs. Team Rocket</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Start a New Game</CardTitle>
                <CardDescription>Get the cards out and start tracking scores.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                <Gamepad2 className="w-24 h-24 text-muted" />
            </CardContent>
            <CardContent>
                <Link href="/game" className="w-full">
                    <Button className="w-full font-headline">
                        New Game <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Review Past Games</CardTitle>
                <CardDescription>Look back at your glorious victories and crushing defeats.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                 <History className="w-24 h-24 text-muted" />
            </CardContent>
            <CardContent>
                <Link href="/history" className="w-full">
                    <Button variant="secondary" className="w-full font-headline">
                        View History <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
