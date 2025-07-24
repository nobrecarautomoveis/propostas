"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// FORÇANDO BASE PROD - HARDCODED
const convex = new ConvexReactClient("https://focused-walrus-736.convex.cloud");

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}