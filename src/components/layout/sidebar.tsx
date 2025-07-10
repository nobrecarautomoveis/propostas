import Link from "next/link";
import { NavLinks } from "./nav-links";

export function AppSidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-card sm:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
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
          <span className="">Fale Mais Fácil</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          <NavLinks />
        </nav>
      </div>
    </aside>
  );
}
