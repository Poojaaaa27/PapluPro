"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/lib/types";
import { Spade } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login({ name: name.trim(), role });
      router.push("/dashboard");
    }
  };
  
  const bgImage = PlaceHolderImages.find(p => p.id === 'login-background');

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4">
       {bgImage && <Image
        src={bgImage.imageUrl}
        alt={bgImage.description}
        fill
        className="object-cover -z-10 brightness-[.4]"
        data-ai-hint={bgImage.imageHint}
        priority
      />}
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
              <Spade className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline text-4xl">Paplu Pro</CardTitle>
            </div>
            <CardDescription className="font-body">
              Sign in to manage your games
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-headline">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="font-headline">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organizer">Organizer</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-headline">
              Enter
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
