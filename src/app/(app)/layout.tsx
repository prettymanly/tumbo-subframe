"use client";

import { usePathname } from "next/navigation";
import { ExploreProvider } from "@/components/explore/explore-context";
import { AppShell } from "@/components/app/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Root "/" uses the v2 explore page which has its own shell + ExploreProvider
  if (pathname === "/" || pathname === "/explore") {
    return <>{children}</>;
  }

  // All other routes (class detail, about, saved) use the legacy AppShell
  return (
    <ExploreProvider>
      <AppShell>{children}</AppShell>
    </ExploreProvider>
  );
}
