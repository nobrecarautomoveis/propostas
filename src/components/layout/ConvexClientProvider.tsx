"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("A variável de ambiente NEXT_PUBLIC_CONVEX_URL não está definida. Verifique o arquivo .env.local ou .env.production.");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}