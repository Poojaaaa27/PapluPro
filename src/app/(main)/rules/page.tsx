
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRules } from "@/hooks/use-rules";
import type { GameRules } from "@/lib/types";

export default function RulesPage() {
    const { rules, setRules, isOrganizer } = useRules();

    const handleRuleChange = (key: keyof GameRules, value: string) => {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue)) {
            setRules(prevRules => ({
                ...prevRules,
                [key]: numericValue,
            }));
        }
    };

    const ruleEntries: { key: keyof GameRules, label: string, description: string }[] = [
        { key: "basePoints", label: "Base Points", description: "Points for a 3-card combination (if active)." },
        { key: "scoot", label: "Scoot", description: "Points for a Scoot (Show)." },
        { key: "midScoot", label: "Mid Scoot", description: "Points for a Middle Scoot." },
        { key: "full", label: "Full", description: "Points for a Full hand." },
        { key: "perPoint", label: "Per Point", description: "Multiplier for card points." },
        { key: "singlePaplu", label: "Single Paplu", description: "Point value for a single paplu." },
        { key: "doublePaplu", label: "Double Paplu", description: "Point value for a double paplu." },
        { key: "triplePaplu", label: "Triple Paplu", description: "Point value for a triple paplu." },
    ];
    
    const gameRuleExplanations = [
        { code: "D", meaning: "Declare / Winner", description: "The player who won the round. They collect points from all losers." },
        { code: "F", meaning: "Full Hand", description: "A losing player with a full hand. Owes a fixed amount to the winner." },
        { code: "S", meaning: "Scoot / Show", description: "A losing player who showed their hand. Owes a fixed amount to the winner." },
        { code: "MS", meaning: "Mid Scoot", description: "A losing player who did a middle scoot. Owes a fixed (higher) amount." },
        { code: "G", meaning: "Gate (Winner Only)", description: "When added to a winner's input (e.g., 'D,G'), it doubles the points collected from regular losers." },
        { code: "-<#>", meaning: "Points", description: "For a regular losing player, this is the sum of their card points (e.g., -25)." },
        { code: "3C", meaning: "3-Card Hand", description: "A special hand. Collects 'Base Points' from all other players before the winner is paid." },
        { code: "1P/2P/3P", meaning: "Paplu (Joker)", description: "Having one, two, or three jokers. Collects points from all other players." },
    ];

    return (
        <div className="py-8 space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                    Game Rules & Points
                </h1>
                <p className="text-muted-foreground mt-1">
                    {isOrganizer ? "Customize the point values for your game." : "View the current point values for the game."}
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Game Inputs & Rules</CardTitle>
                    <CardDescription>
                        A reference guide for the input codes used during score entry.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {gameRuleExplanations.map((rule) => (
                             <div key={rule.code} className="flex items-start gap-4">
                                <code className="font-mono text-base font-bold bg-muted text-primary rounded-md px-2 py-1 mt-1">{rule.code}</code>
                                <div className="flex-1">
                                    <p className="font-bold font-headline">{rule.meaning}</p>
                                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Points Customization</CardTitle>
                    <CardDescription>
                        {isOrganizer
                            ? "Changes made here will be saved locally and applied to all calculations."
                            : "Only organizers can edit these values."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        {ruleEntries.map(({ key, label, description }) => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={key} className="font-headline text-lg">{label}</Label>
                                <Input
                                    id={key}
                                    type="number"
                                    value={rules[key]}
                                    onChange={(e) => handleRuleChange(key, e.target.value)}
                                    disabled={!isOrganizer}
                                    className="max-w-xs"
                                />
                                <p className="text-sm text-muted-foreground">{description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
