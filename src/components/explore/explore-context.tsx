"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { WarmTag } from "@/lib/rails/types";

export interface ClassCardData {
  id: string;
  title: string;
  provider?: string;
  summary?: string;
  image?: string;
  tags: WarmTag[];
  rating?: number;
  reviewCount?: number;
  location?: string;
  price?: number | string;
}

interface ExploreContextType {
  view: "browse" | "detail";
  selectedClassId: string | null;
  selectedCardData: ClassCardData | null;
  selectClass: (id: string, cardData: ClassCardData) => void;
  goBack: () => void;
}

const ExploreContext = createContext<ExploreContextType | null>(null);

export function useExplore(): ExploreContextType {
  const ctx = useContext(ExploreContext);
  if (!ctx) {
    throw new Error("useExplore must be used within an ExploreProvider");
  }
  return ctx;
}

function parsePathnameForDetail(pathname: string): string | null {
  // Match /class/{id} (new app routes) or /explore/{id} (legacy)
  const match = pathname.match(/^\/class\/(.+)$/) || pathname.match(/^\/explore\/(.+)$/);
  return match ? match[1] : null;
}

export function ExploreProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Initialize state based on current pathname
  const initialId = parsePathnameForDetail(pathname);

  const [view, setView] = useState<"browse" | "detail">(
    initialId ? "detail" : "browse"
  );
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    initialId
  );
  const [selectedCardData, setSelectedCardData] = useState<ClassCardData | null>(
    null
  );

  // Sync view state when pathname changes (browser back/forward)
  useEffect(() => {
    const id = parsePathnameForDetail(pathname);
    if (id) {
      setView("detail");
      setSelectedClassId(id);
      // Note: cardData won't be available on back/forward navigation
      // unless it was previously cached; we keep whatever was stored
    } else {
      setView("browse");
      setSelectedClassId(null);
      setSelectedCardData(null);
    }
  }, [pathname]);

  const selectClass = useCallback(
    (id: string, cardData: ClassCardData) => {
      setView("detail");
      setSelectedClassId(id);
      setSelectedCardData(cardData);
      router.push(`/explore/${id}`, { scroll: false });
    },
    [router]
  );

  const goBack = useCallback(() => {
    setView("browse");
    setSelectedClassId(null);
    setSelectedCardData(null);
    router.push("/explore", { scroll: false });
  }, [router]);

  return (
    <ExploreContext.Provider
      value={{ view, selectedClassId, selectedCardData, selectClass, goBack }}
    >
      {children}
    </ExploreContext.Provider>
  );
}
