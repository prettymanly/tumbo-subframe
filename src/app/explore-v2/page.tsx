"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExploreProvider } from "@/components/explore/explore-context";
import { ExploreBrowse } from "@/components/explore/explore-browse-v2";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/ui/auth-modal";

const TOPBAR_HEIGHT = 56;
const CONTAINER_MAX = "min(1600px, calc(100% - 48px))";

/**
 * Returns a snapToContent callback + manages scroll-based snap.
 * Any scroll while in the hero zone snaps past the hero so the filter
 * bar sits just below the sticky nav. Once past, scrolling is free.
 * Scrolling back to top resets the snap.
 */
function useHeroSnap(contentId: string) {
  const snappedRef = useRef(false);
  const lockRef = useRef(false);

  const getSnapTarget = useCallback(() => {
    const content = document.getElementById(contentId);
    return content ? content.offsetTop - TOPBAR_HEIGHT - 48 : 0;
  }, [contentId]);

  const snapToContent = useCallback(() => {
    const content = document.getElementById(contentId);
    if (!content || lockRef.current) return;
    const snapTarget = getSnapTarget();
    if (snappedRef.current) return;
    lockRef.current = true;
    snappedRef.current = true;
    document.getElementById("v2-hero")?.classList.add("v2-hero-snapped");
    window.scrollTo({ top: snapTarget, behavior: "smooth" });
    setTimeout(() => { lockRef.current = false; }, 700);
  }, [contentId, getSnapTarget]);

  useEffect(() => {
    const content = document.getElementById(contentId);
    if (!content) return;

    // --- Scroll listener: initial snap + reset ---
    const scrollHandler = () => {
      if (lockRef.current) return;
      const scrollY = window.scrollY;
      const snapTarget = getSnapTarget();

      // First snap: user scrolls slightly in hero zone (desktop only)
      if (!snappedRef.current && scrollY > 30 && scrollY < snapTarget - 50 && window.innerWidth > 768) {
        snapToContent();
      }

      // Reset when back at top
      if (scrollY < 10) {
        snappedRef.current = false;
        document.getElementById("v2-hero")?.classList.remove("v2-hero-snapped");
      }
    };

    // --- Position guard: when DOM changes inside the content area
    // (tag pills toggled, results filtered), browser scroll-anchoring
    // can drag scrollY back into the hero zone. A MutationObserver
    // detects these layout changes and instantly corrects position. ---
    const positionGuard = () => {
      if (!snappedRef.current || lockRef.current) return;
      const snapTarget = getSnapTarget();
      const drift = Math.abs(window.scrollY - snapTarget);
      if (drift > 5 && window.scrollY < snapTarget - 5) {
        window.scrollTo({ top: snapTarget, behavior: "instant" });
      }
    };

    const observer = new MutationObserver(() => {
      // RAF so the layout has settled before we measure
      requestAnimationFrame(positionGuard);
    });
    observer.observe(content, { childList: true, subtree: true, attributes: true });

    window.addEventListener("scroll", scrollHandler, { passive: true });
    return () => {
      window.removeEventListener("scroll", scrollHandler);
      observer.disconnect();
    };
  }, [contentId, snapToContent, getSnapTarget]);

  return snapToContent;
}

const NAV_ITEMS = [
  { href: "/", label: "Explore" },
  { href: "/about", label: "About" },
];

const NAV_ICONS: Record<string, React.ReactNode> = {
  Explore: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={11} cy={11} r={8} />
      <line x1={21} y1={21} x2={16.65} y2={16.65} />
    </svg>
  ),
  About: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={10} />
      <line x1={12} y1={16} x2={12} y2={12} />
      <line x1={12} y1={8} x2={12.01} y2={8} />
    </svg>
  ),
  Saved: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  // Animate in/out
  useEffect(() => {
    if (open) {
      // Mount then fade in
      setVisible(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setOpen(false), 220);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Hamburger geometry: 3 lines, each 2px tall, spaced 6px apart (center-to-center 8px)
  // When morphing to X: top line translates down 8px + rotates 45deg,
  // bottom line translates up 8px + rotates -45deg, middle fades out.
  const LINE_H = 2;
  const LINE_GAP = 6; // gap between lines
  const LINE_SHIFT = LINE_H + LINE_GAP; // 8px — distance from top/bottom line to center

  return (
    <div ref={menuRef} style={{ position: "relative", zIndex: 110 }}>
      {/* Burger button — morphs to X */}
      <button
        onClick={() => (open ? handleClose() : setOpen(true))}
        aria-label={open ? "Close menu" : "Open menu"}
        style={{
          width: 36,
          height: 36,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: LINE_GAP,
          padding: 0,
          position: "relative",
          zIndex: 120,
        }}
      >
        {/* Top line → rotates to form \ of X */}
        <span
          style={{
            display: "block",
            width: 22,
            height: LINE_H,
            background: "var(--tumbo-text)",
            borderRadius: 1,
            transition: "transform 0.35s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.25s ease",
            transform: open ? `translateY(${LINE_SHIFT}px) rotate(45deg)` : "none",
            transformOrigin: "center",
          }}
        />
        {/* Middle line → fades out */}
        <span
          style={{
            display: "block",
            width: 22,
            height: LINE_H,
            background: "var(--tumbo-text)",
            borderRadius: 1,
            transition: "opacity 0.2s ease, transform 0.2s ease",
            opacity: open ? 0 : 1,
            transform: open ? "scaleX(0)" : "scaleX(1)",
          }}
        />
        {/* Bottom line → rotates to form / of X */}
        <span
          style={{
            display: "block",
            width: 22,
            height: LINE_H,
            background: "var(--tumbo-text)",
            borderRadius: 1,
            transition: "transform 0.35s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.25s ease",
            transform: open ? `translateY(-${LINE_SHIFT}px) rotate(-45deg)` : "none",
            transformOrigin: "center",
          }}
        />
      </button>

      {/* Dropdown panel — appears below the burger, no separate close button */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: 44,
            right: -12,
            zIndex: 100,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.96)",
            transition: "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            transformOrigin: "top right",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 4px 32px rgba(72, 72, 74, 0.13), 0 0 0 1px rgba(0,0,0,0.04)",
              padding: "20px 28px 20px 24px",
              minWidth: 220,
            }}
          >
            {/* Nav links + auth — flat list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV_ITEMS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={handleClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 4px",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--tumbo-text)",
                    textDecoration: "none",
                    borderRadius: 10,
                    transition: "background 0.12s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ opacity: 0.45, display: "flex" }}>
                    {NAV_ICONS[label]}
                  </span>
                  {label}
                </Link>
              ))}

              {/* Auth: sign out or sign in — directly under Saved */}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    handleClose();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 4px",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--tumbo-text)",
                    background: "transparent",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "background 0.12s",
                    fontFamily: "inherit",
                    textAlign: "left",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ opacity: 0.45, display: "flex" }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1={21} y1={12} x2={9} y2={12} />
                    </svg>
                  </span>
                  Sign out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthModalOpen(true);
                    handleClose();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 4px",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--tumbo-text)",
                    background: "transparent",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "background 0.12s",
                    fontFamily: "inherit",
                    textAlign: "left",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ opacity: 0.45, display: "flex" }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1={15} y1={12} x2={3} y2={12} />
                    </svg>
                  </span>
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </div>
  );
}

function HeroSnapEffect({ onSnap }: { onSnap: (fn: () => void) => void }) {
  const snap = useHeroSnap("v2-browse-content");
  useEffect(() => { onSnap(() => snap()); }, [snap, onSnap]);
  return null;
}

export default function ExploreV2Page() {
  const snapFnRef = useRef<(() => void) | null>(null);
  const handleSnap = useCallback((fn: () => void) => { snapFnRef.current = fn; }, []);

  // Scroll to top on mount (fixes mobile starting mid-page)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ExploreProvider>
      <HeroSnapEffect onSnap={handleSnap} />
      <div style={{ minHeight: "100vh", background: "var(--tumbo-background)" }}>
        {/* Top nav bar */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "var(--tumbo-background)",
          }}
        >
          <div
            style={{
              maxWidth: CONTAINER_MAX,
              margin: "0 auto",
              height: TOPBAR_HEIGHT,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              gap: 16,
            }}
          >
            {/* Left: logo */}
            <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
                <Image
                  src="/photos/Default/TumboLogo.png"
                  alt="Tumbo"
                  width={80}
                  height={28}
                  style={{ display: "block" }}
                />
              </Link>
            </div>

            {/* Center: search portal target */}
            <div id="v2-search-portal" style={{ flex: 1, maxWidth: 540, minWidth: 0 }} />

            {/* Right: search icon + hamburger */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <div id="v2-search-icon-portal" />
              <HamburgerMenu />
            </div>
          </div>
        </header>

        {/* ── Hero section ── takes ~75% of remaining viewport so content peeks below */}
        {/* Responsive hero styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* ── Subhead hides when snapped ── */
          .v2-hero-subhead {
            transition: opacity 0.3s ease;
          }
          .v2-hero-snapped .v2-hero-subhead {
            opacity: 0;
            pointer-events: none;
          }

          /* ── Base: headline + subhead grouped ── */
          .v2-hero-inner {
            padding-top: max(48px, 10vh);
          }
          .v2-hero-headline {
            font-family: var(--font-lexend), system-ui, sans-serif;
            font-size: clamp(40px, 8.3vw, 120px);
            font-weight: 700;
            line-height: 0.88;
            letter-spacing: -0.05em;
            color: var(--tumbo-text);
            margin: 0;
          }
          .v2-hero-headline .v2-br { display: inline; }
          .v2-hero-headline .v2-br-mobile { display: none; }
          .v2-hero-subhead {
            font-size: clamp(18px, 2.35vw, 34px);
            line-height: 1.2;
            color: var(--tumbo-label, #888);
            margin-top: clamp(24px, 3vw, 48px);
            font-weight: 400;
            letter-spacing: -0.02em;
          }

          /* ── Wide desktop: split — headline top, subhead bottom ── */
          @media (min-width: 1024px) {
            .v2-hero-inner {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 100%;
              padding-top: max(32px, 4vh);
              padding-bottom: max(16px, 2vh);
            }
            .v2-hero-subhead {
              margin-top: 0;
            }
          }

          /* ── Mobile: space-between like desktop, word-per-line headline ── */
          @media (max-width: 640px) {
            .v2-hero-inner {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 100%;
              padding-top: max(16px, 3vh);
              padding-bottom: max(12px, 2vh);
            }
            .v2-hero-headline {
              font-size: 14vw;
              line-height: 0.92;
              letter-spacing: -0.04em;
            }
            /* On mobile, hide the desktop <br>s and use mobile-specific ones */
            .v2-hero-headline .v2-br { display: none; }
            .v2-hero-headline .v2-br-mobile { display: inline; }
            .v2-hero-subhead {
              font-size: 15px;
              line-height: 1.4;
              margin-top: 0;
              font-weight: 400;
              color: var(--tumbo-label, #999);
            }
          }
        `}} />
        <div
          id="v2-hero"
          style={{
            height: `calc(100svh - ${TOPBAR_HEIGHT}px - 100px)`,
            minHeight: 280,
            display: "flex",
            alignItems: "center",
            maxWidth: CONTAINER_MAX,
            margin: "0 auto",
            padding: "0 24px",
            overflowAnchor: "none",
          }}
        >
          <div className="v2-hero-inner">
            <h1 className="v2-hero-headline">
              The best{" "}
              <span className="v2-br-mobile"><br /></span>
              classes{" "}
              <span className="v2-br"><br /></span>
              <span className="v2-br-mobile"><br /></span>
              aren&rsquo;t{" "}
              <span className="v2-br-mobile"><br /></span>
              always{" "}
              <span className="v2-br"><br /></span>
              <span className="v2-br-mobile"><br /></span>
              <span
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  textDecoration: "underline",
                  textDecorationThickness: "0.04em",
                  textUnderlineOffset: "0.08em",
                }}
              >
                the best
              </span>{" "}
              <span className="v2-br-mobile"><br /></span>
              classes.
            </h1>
            <p className="v2-hero-subhead">
              Find{" "}
              <span style={{ color: "var(--tumbo-primary, #E8530E)" }}>
                enrichment classes that match your child
              </span>
              , not the crowd.
            </p>
          </div>
        </div>

        {/* ── Content: filter bar + browse ── peeks above fold, scroll-snap target */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          id="v2-browse-content"
          onClickCapture={(e) => {
            // Only snap (and block the click) when still in hero zone
            // Skip on mobile — let users interact with filters without snapping
            if (window.innerWidth <= 768) return;
            const content = document.getElementById("v2-browse-content");
            if (!content) return;
            const snapTarget = content.offsetTop - TOPBAR_HEIGHT - 48;
            if (window.scrollY < snapTarget - 50) {
              e.stopPropagation();
              e.preventDefault();
              snapFnRef.current?.();
            }
          }}
          style={{
            maxWidth: CONTAINER_MAX,
            margin: "0 auto",
            padding: "0 24px",
            overflowAnchor: "none",
            minHeight: "100vh",
          }}
        >
          <ExploreBrowse />
        </div>
      </div>

      {/* Disable browser scroll-anchoring so toggling tag pills (which
          change result count & page height) can't drag scrollY back into
          the hero zone. The re-snap guard in useHeroSnap is the fallback. */}
      <style>{`
        #v2-browse-content, #v2-browse-content * {
          overflow-anchor: none !important;
        }
        @keyframes v2-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(6px); opacity: 0.6; }
        }
      `}</style>
    </ExploreProvider>
  );
}
