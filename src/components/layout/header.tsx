'use client';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, CircleUser } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLinks } from "./nav-links";

export function Header() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.startsWith('/propostas/nova')) return 'Nova Proposta';
    if (pathname.startsWith('/propostas')) return 'Propostas';
    return 'Fale Mais Fácil';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
       <Link href="/propostas" className="flex items-center gap-2 font-semibold text-lg md:text-xl">
           <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M15 6.343a4.5 4.5 0 0 1 0 6.314" />
              <path d="M18.071 3.272a9 9 0 0 1 0 12.728" />
              <path d="M5.003 6.57A4.5 4.5 0 0 1 7.83 5.003" />
              <path d="M2.93 3.515A9 9 0 0 1 9.485 2.93" />
              <path d="M12 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path d="M12 12v6.5" />
              <path d="M12 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
              <path d="m20 2-2 2" />
              <path d="m3 21 2-2" />
            </svg>
          <span className="hidden sm:inline-block">Fale Mais Fácil</span>
        </Link>
      
      <div className="flex-1">
        <h1 className="text-xl font-semibold md:text-center">{getPageTitle()}</h1>
      </div>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuItem>Suporte</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">Sair</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
