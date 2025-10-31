
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();

  const routes = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/teams", label: "Setup" },
    { href: "/game", label: "Game" },
    { href: "/scores", label: "Game Sheet" },
    { href: "/history", label: "History" },
    { href: "/rules", label: "Rules" },
    { href: "/analytics", label: "Analytics" },
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary font-headline",
            pathname.startsWith(route.href) && (route.href !== "/" || pathname === "/")
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
