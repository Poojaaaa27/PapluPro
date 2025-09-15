
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

    return (
        <div className="py-8">
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
                    <CardTitle>Points Customization</CardTitle>
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
