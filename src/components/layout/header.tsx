'use client';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { useCurrentUser } from "@/hooks/use-current-user";

export function Header() {
  const { currentUser, logout } = useCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-card px-4 sm:px-6">
      <Link href="/propostas">
          <Image 
            src="/logo.png" 
            alt="Nobrecar Automóveis Logo" 
            width={180} 
            height={60} 
          />
      </Link>

      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <UserRound className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{currentUser?.name || 'Minha Conta'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/usuarios">Usuários</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href="/">Sair</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
