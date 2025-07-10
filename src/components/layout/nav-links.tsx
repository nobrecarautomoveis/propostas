'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, MicVocal } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: '/dashboard', label: 'Conversas', icon: MicVocal },
  { href: '/propostas', label: 'Propostas', icon: FileText },
];

export function NavLinks({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary",
              isMobile && "gap-4 text-base"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </>
  );
}
