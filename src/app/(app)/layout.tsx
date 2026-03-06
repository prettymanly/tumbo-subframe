"use client";

import { ExploreProvider } from "@/components/explore/explore-context";
import { AppShell } from "@/components/app/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ExploreProvider>
      <AppShell>{children}</AppShell>
    </ExploreProvider>
  );
}
