
"use-client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRules } from "@/hooks/use-rules";
import type { GameRules } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function RulesPage() {
    const { rules, setRules, isOrganizer } = useRules();
    const [showRules, setShowRules] = useState(false);

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
        { key: "threeCardHand", label: "3-Card Hand (3C)", description: "Points collected by the 3-card winner from all other players." },
        { key: "scoot", label: "Scoot / Drop (S)", description: "Fixed points a player pays to the winner for an initial drop." },
        { key: "midScoot", label: "Mid Scoot (MS)", description: "Fixed points a player pays to the winner for a middle drop." },
        { key: "full", label: "Full Hand (F)", description: "Fixed points a player pays to the winner if they don't meet minimum conditions." },
        { key: "perPoint", label: "Per Point Multiplier", description: "Multiplier for a regular loser's card points." },
        { key: "singlePaplu", label: "Single Paplu (1P)", description: "Points collected from all others for holding one paplu." },
        { key: "doublePaplu", label: "Double Paplu (2P)", description: "Points collected from all others for holding two paplus." },
        { key: "triplePaplu", label: "Triple Paplu (3P)", description: "Points collected from all others for holding three paplus." },
    ];
    
    const gameRuleExplanations = [
        {
            code: "3C",
            meaning: "3-Card Hand",
            description: "For the first 3 cards, the winner of the three cards in each round will receive a pre-defined amount (default: 10 points) from every other player."
        },
        {
            code: "1P/2P/3P",
            meaning: "Paplu (Joker)",
            description: "If a player holds one, two, or three paplus (jokers), all other players must pay them a pre-defined amount (e.g., 10 for 1P, 30 for 2P, 50 for 3P). This transaction happens independently of who wins the round."
        },
        {
            code: "S",
            meaning: "Scoot / Drop",
            description: "A player who excuses themselves at their first chance (an initial drop) pays a fixed 'Scoot' amount (default: 10 points) to the winner of that round."
        },
        {
            code: "MS",
            meaning: "Mid Scoot",
            description: "A player who drops out in the middle of a round pays a fixed 'Mid Scoot' amount (default: 20 points) to the winner."
        },
        {
            code: "F",
            meaning: "Full Hand",
            description: "If a player continues playing but fails to meet the minimum required conditions before someone wins, they must pay a fixed 'Full Hand' amount (default: 40 points) to the winner."
        },
        {
            code: "-<#>",
            meaning: "Normal Points",
            description: "A player who doesn't drop but loses the game pays the winner based on the value of the cards remaining in their hand. The total card value is multiplied by the 'Per Point Multiplier'."
        },
        {
            code: "G",
            meaning: "Gate / Double",
            description: "A winning player can claim double points from all other playing opponents. However, they cannot claim double from players who opted for 'Scoot' (S) or 'Mid Scoot' (MS)."
        },
        {
            code: "D",
            meaning: "Winner (Declare)",
            description: "Denotes the winner of the round. All other players will pay the winner based on their points and status, after adjusting for any Paplu or 3C payouts."
        }
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

            <div className="flex justify-start mb-4">
                <Button onClick={() => setShowRules(!showRules)} variant="outline">
                    {showRules ? <EyeOff className="mr-2" /> : <Eye className="mr-2" />}
                    {showRules ? 'Hide Full Rules' : 'View Full Rules'}
                </Button>
            </div>
            
            {showRules && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Game Inputs & Rules</CardTitle>
                        <CardDescription>
                            A reference guide for the input codes used during score entry and how scores are calculated.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {gameRuleExplanations.map((rule) => (
                                <div key={rule.code} className="flex items-start gap-4">
                                    <code className="font-mono text-base font-bold bg-muted text-primary rounded-md px-2 py-1 mt-1 shrink-0">{rule.code}</code>
                                    <div className="flex-1">
                                        <p className="font-bold font-headline">{rule.meaning}</p>
                                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

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
