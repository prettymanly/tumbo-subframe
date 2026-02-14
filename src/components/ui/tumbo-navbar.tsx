"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { AuthModal } from "@/components/ui/auth-modal"

export default function TumboNavbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [comingSoonToast, setComingSoonToast] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const comingSoonRef = useRef<HTMLDivElement>(null)

  // Scroll-aware frosted glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false)
      if (comingSoonRef.current && !comingSoonRef.current.contains(e.target as Node))
        setComingSoonToast(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const homeUrl = isAuthenticated ? "/userdashboard" : "/"

  return (
    <>
      <header
        className={cn(
          "w-full sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border-b border-neutral-200/50"
            : "bg-[var(--tumbo-background)] border-b border-transparent"
        )}
      >
        <nav className="flex h-14 items-center justify-between px-5 md:px-8 max-w-[1440px] mx-auto w-full">
          {/* ── Left: Logo + nav links ── */}
          <div className="flex items-center gap-8">
            <Link href={homeUrl} className="flex-shrink-0">
              <img
                className="h-5 object-contain"
                src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                alt="Tümbo"
              />
            </Link>

            {/* Desktop links — flat, no dropdown */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/classes"
                className="relative px-3 py-2 text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 group"
              >
                Classes
                <span className="absolute bottom-0.5 left-3 right-3 h-[1.5px] bg-[var(--tumbo-orange)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
              </Link>

              <Link
                href="/providers"
                className="relative px-3 py-2 text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 group"
              >
                Providers
                <span className="absolute bottom-0.5 left-3 right-3 h-[1.5px] bg-[var(--tumbo-orange)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
              </Link>

              {/* Ask Tümbo — coming soon teaser */}
              <div ref={comingSoonRef} className="relative">
                <button
                  onClick={() => {
                    setComingSoonToast(!comingSoonToast)
                  }}
                  className="relative flex items-center gap-1.5 px-3 py-2 text-[14px] font-medium text-gray-400 hover:text-gray-500 transition-colors duration-200 bg-transparent border-0 cursor-pointer"
                >
                  Ask Tümbo
                  <span className="px-1.5 py-[1px] rounded-full bg-[var(--tumbo-orange)]/10 text-[var(--tumbo-orange)] text-[9px] font-bold uppercase tracking-wider leading-none">
                    Soon
                  </span>
                </button>

                {/* Coming soon popover */}
                <div
                  className={cn(
                    "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl bg-white p-4 shadow-lg shadow-black/[0.08] ring-1 ring-black/[0.05] transition-all duration-200 origin-top z-50",
                    comingSoonToast
                      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-[0.97] -translate-y-1 pointer-events-none"
                  )}
                >
                  <p className="text-[13px] font-semibold text-gray-900 mb-1">Coming Soon</p>
                  <p className="text-[12px] text-gray-400 leading-relaxed">
                    Our AI assistant will help you find the perfect class for your child. For now, browse our class directory.
                  </p>
                  <Link
                    href="/classes"
                    className="inline-block mt-2.5 text-[12px] font-semibold text-[var(--tumbo-orange)] hover:underline"
                    onClick={() => setComingSoonToast(false)}
                  >
                    Browse classes →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Auth / User ── */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--tumbo-orange)] rounded-full" />
                </button>

                {/* User avatar → dashboard */}
                <div ref={userMenuRef} className="relative">
                  <button
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-semibold text-gray-500 hover:ring-2 hover:ring-neutral-200 transition-all duration-200 overflow-hidden"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </button>

                  {/* User dropdown */}
                  <div
                    className={cn(
                      "absolute top-full right-0 mt-2 w-52 rounded-xl bg-white p-1.5 shadow-lg shadow-black/[0.08] ring-1 ring-black/[0.05] transition-all duration-150 origin-top-right",
                      userMenuOpen
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-[0.97] -translate-y-1 pointer-events-none"
                    )}
                  >
                    {user && (
                      <div className="px-3 py-2 mb-1">
                        <p className="text-[13px] font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-[12px] text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    )}
                    <div className="h-px bg-neutral-100 mx-1 mb-1" />
                    <Link
                      href="/userdashboard"
                      className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-gray-600 hover:bg-neutral-50 hover:text-gray-900 transition-colors duration-150 no-underline"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                      </svg>
                      Saved Classes
                    </Link>
                    <div className="h-px bg-neutral-100 mx-1 my-1" />
                    <button
                      onClick={() => {
                        logout()
                        setUserMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 bg-transparent border-0 cursor-pointer text-left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button
                  className="px-3 py-1.5 text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 bg-transparent border-0 cursor-pointer"
                  onClick={() => {
                    setAuthMode("signin")
                    setAuthModalOpen(true)
                  }}
                >
                  Sign in
                </button>
                <button
                  className="px-4 py-1.5 text-[14px] font-medium text-white bg-[var(--tumbo-orange)] hover:opacity-90 rounded-full transition-opacity duration-200 border-0 cursor-pointer"
                  onClick={() => {
                    setAuthMode("register")
                    setAuthModalOpen(true)
                  }}
                >
                  Register
                </button>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors duration-200 bg-transparent border-0 cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 9h16.5m-16.5 6.75h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile slide-down menu */}
        <div
          className={cn(
            "md:hidden border-t border-neutral-100 bg-white/95 backdrop-blur-xl overflow-hidden transition-all duration-200",
            mobileMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-5 py-3 flex flex-col gap-0.5">
            <Link
              href="/classes"
              className="px-3 py-2.5 text-[14px] font-medium text-gray-600 hover:text-gray-900 hover:bg-neutral-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Classes
            </Link>
            <Link
              href="/providers"
              className="px-3 py-2.5 text-[14px] font-medium text-gray-600 hover:text-gray-900 hover:bg-neutral-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Providers
            </Link>
            <div className="px-3 py-2.5 flex items-center gap-2">
              <span className="text-[14px] font-medium text-gray-300">
                Ask Tümbo
              </span>
              <span className="px-1.5 py-[1px] rounded-full bg-[var(--tumbo-orange)]/10 text-[var(--tumbo-orange)] text-[9px] font-bold uppercase tracking-wider leading-none">
                Soon
              </span>
            </div>
            <div className="h-px bg-neutral-100 mx-3 my-1" />
            <Link
              href="/business"
              className="px-3 py-2.5 text-[13px] font-medium text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              For Businesses →
            </Link>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </>
  )
}
