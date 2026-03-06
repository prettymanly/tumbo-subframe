"use client";

import { ExploreProvider } from "@/components/explore/explore-context";
import { ExploreShell } from "@/components/explore/explore-shell";

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <ExploreProvider>
      <ExploreShell />
      {/* children is page.tsx — empty, shell reads pathname */}
      <div style={{ display: "none" }}>{children}</div>
    </ExploreProvider>
  );
}
