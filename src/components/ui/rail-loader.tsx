"use client";

import React, { useRef, useEffect, useCallback } from "react";

// ── IntersectionObserver wrapper ──
// Triggers `onVisible` when the sentinel div enters the viewport
// (or comes within `rootMargin` of it). Fires once, then disconnects.

interface RailLoaderProps {
  /** Called when the sentinel enters the viewport threshold */
  onVisible: () => void;
  /** How far ahead to trigger (default "800px") */
  rootMargin?: string;
  /** Children to render (typically a RailSkeleton) */
  children?: React.ReactNode;
  /** Unique key for debugging */
  railId?: string;
}

export function RailLoader({
  onVisible,
  rootMargin = "800px 0px",
  children,
}: RailLoaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (firedRef.current) return;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          firedRef.current = true;
          onVisible();
          return;
        }
      }
    },
    [onVisible]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || firedRef.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersection, rootMargin]);

  return <div ref={sentinelRef}>{children}</div>;
}
