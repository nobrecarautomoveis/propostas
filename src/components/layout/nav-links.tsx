'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
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
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:bg-muted/50",
              isActive && "bg-primary/10 text-primary border border-primary/20",
              isMobile && "gap-4 text-base py-3"
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
