"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { AuthModal } from "@/components/ui/auth-modal"

/**
 * MagicPath-style floating pill navbar.
 * Used across V2 directory, V3 directory, and class detail pages.
 * Same links as TumboNavbar, MagicPath aesthetic.
 */
export default function MPNavbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const homeUrl = "/explore"

  return (
    <>
      {/* ── Desktop navbar: floating pill ── */}
      <nav
        className="hidden md:flex sticky z-50 items-center justify-between h-[60px] bg-[var(--tumbo-background)] border border-black/[0.08] px-5 pl-9"
        style={{
          top: 12,
          borderRadius: 24,
          maxWidth: "min(1280px, calc(100% - 48px))",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Left: Logo */}
        <Link href={homeUrl} className="flex-shrink-0 no-underline">
          <Image src="/photos/Default/TumboLogo.png" alt="Tumbo" width={80} height={28} style={{ objectFit: "contain" }} priority />
        </Link>

        {/* Center: Nav links */}
        <div className="flex items-center gap-1">
          <NavPill href="/explore" label="Explore" />
          <SavedPill />
        </div>

        {/* Right: Auth */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div ref={userMenuRef} className="relative">
              <button
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-semibold text-gray-500 hover:ring-2 hover:ring-neutral-200 transition-all overflow-hidden border-0 cursor-pointer"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </button>

              {/* User dropdown */}
              <div
                className={cn(
                  "absolute top-full right-0 mt-2 w-52 rounded-xl bg-[var(--tumbo-background)] p-1.5 shadow-lg shadow-black/[0.08] ring-1 ring-black/[0.05] transition-all duration-150 origin-top-right",
                  userMenuOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-[0.97] -translate-y-1 pointer-events-none"
                )}
              >
                {user && (
                  <div className="px-3 py-2 mb-1">
                    <p className="text-[13px] font-semibold text-gray-900 truncate m-0">{user.name}</p>
                    <p className="text-[12px] text-gray-400 truncate m-0">{user.email}</p>
                  </div>
                )}
                <div className="h-px bg-neutral-100 mx-1 mb-1" />
                <Link
                  href="/explore"
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-gray-600 hover:bg-neutral-50 hover:text-gray-900 transition-colors no-underline"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Saved Classes
                </Link>
                <div className="h-px bg-neutral-100 mx-1 my-1" />
                <button
                  onClick={() => { logout(); setUserMenuOpen(false) }}
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors bg-transparent border-0 cursor-pointer text-left"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                className="px-3 py-1.5 text-[13px] font-medium text-black/50 hover:text-black transition-colors bg-transparent border-0 cursor-pointer"
                style={{ fontFamily: "inherit" }}
                onClick={() => { setAuthMode("signin"); setAuthModalOpen(true) }}
              >
                Sign in
              </button>
              <button
                className="px-[18px] py-2 text-[13px] font-semibold text-white bg-[var(--tumbo-orange)] hover:opacity-90 border-0 cursor-pointer transition-opacity"
                style={{ borderRadius: 100, fontFamily: "inherit" }}
                onClick={() => { setAuthMode("register"); setAuthModalOpen(true) }}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Mobile: sticky top bar + slide-down menu ── */}
      <div className="md:hidden">
        <header
          className="sticky top-0 z-50 flex items-center justify-between px-5 h-14"
          style={{
            background: "rgba(253,251,247,0.96)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Link href={homeUrl} className="flex-shrink-0 no-underline">
            <Image src="/photos/Default/TumboLogo.png" alt="Tumbo" width={68} height={24} style={{ objectFit: "contain" }} priority />
          </Link>

          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <button
                className="px-4 py-2 text-[13px] font-semibold text-white bg-[var(--tumbo-orange)] border-0 cursor-pointer min-h-[44px]"
                style={{ borderRadius: 100, fontFamily: "inherit" }}
                onClick={() => { setAuthMode("register"); setAuthModalOpen(true) }}
              >
                Sign up
              </button>
            )}
            <button
              className="p-3 -mr-1 text-gray-500 hover:text-gray-900 transition-colors bg-transparent border-0 cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                )}
              </svg>
            </button>
          </div>
        </header>

        {/* Backdrop overlay — tap outside to dismiss */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMobileMenuOpen(false)}
            style={{ background: "var(--color-border-strong)" }}
          />
        )}

        {/* Slide-down mobile menu */}
        <div
          className={cn(
            "relative z-50 border-b border-black/[0.08] overflow-hidden transition-all duration-200",
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
          style={{
            background: "rgba(253,251,247,0.96)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="px-5 py-3 flex flex-col gap-0.5">
            <MobileNavLink href="/explore" label="Explore" onClick={() => setMobileMenuOpen(false)} />
            <MobileSavedLink />
            {isAuthenticated && (
              <>
                <div className="h-px bg-neutral-100 mx-3 my-1" />
                <MobileNavLink href="/explore" label="Saved Classes" onClick={() => setMobileMenuOpen(false)} />
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false) }}
                  className="px-3 py-3 text-[14px] font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-0 cursor-pointer text-left min-h-[44px]"
                >
                  Sign out
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <div className="h-px bg-neutral-100 mx-3 my-1" />
                <button
                  onClick={() => { setAuthMode("signin"); setAuthModalOpen(true); setMobileMenuOpen(false) }}
                  className="px-3 py-3 text-[14px] font-medium text-gray-600 hover:text-gray-900 hover:bg-neutral-50 rounded-lg transition-colors bg-transparent border-0 cursor-pointer text-left min-h-[44px]"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </>
  )
}

/* ── Desktop nav pill button ── */
function NavPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-[7px] text-[13px] font-medium text-black/50 hover:text-black hover:bg-black/[0.04] no-underline transition-all"
      style={{ borderRadius: 100, fontFamily: "inherit" }}
    >
      {label}
    </Link>
  )
}

/* ── Mobile nav link ── */
function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      className="px-3 py-3 text-[14px] font-medium text-gray-600 hover:text-gray-900 hover:bg-neutral-50 rounded-lg transition-colors no-underline min-h-[44px] flex items-center"
      onClick={onClick}
    >
      {label}
    </Link>
  )
}

/* ── Desktop "Saved" pill — greyed out with tooltip ── */
function SavedPill() {
  return (
    <span className="relative group">
      <span
        className="px-4 py-[7px] text-[13px] font-medium text-black/20 cursor-default inline-flex items-center"
        style={{ borderRadius: 100, fontFamily: "inherit" }}
      >
        Saved
      </span>
      {/* Tooltip */}
      <span
        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 text-[11px] font-medium text-white bg-black/80 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
        style={{ backdropFilter: "blur(8px)" }}
      >
        Coming soon
      </span>
    </span>
  )
}

/* ── Mobile "Saved" link — greyed out with inline label ── */
function MobileSavedLink() {
  return (
    <span className="px-3 py-3 text-[14px] font-medium text-gray-300 rounded-lg flex items-center justify-between cursor-default min-h-[44px]">
      <span>
        Saved
      </span>
      <span className="text-[10px] font-semibold tracking-wide uppercase text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
        Soon
      </span>
    </span>
  )
}
