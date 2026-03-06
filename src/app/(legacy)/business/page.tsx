"use client"

import React, { useState } from "react"
import Link from "next/link"
import { FadeInUp } from "@/components/ui/fade-in-up"

// ── Feature card data ──
const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
      </svg>
    ),
    title: "Update your info",
    description: "Keep your class schedule, pricing, contact details, and photos current. Parents see your latest info instantly.",
    tag: "You control",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: "We handle the narrative",
    description: "Our editorial team writes review summaries, tags, and vibe descriptions from aggregated online sources. You focus on running great classes.",
    tag: "Tümbo curates",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: "Multi-location ready",
    description: "Manage multiple outlets from one account. Franchise owners see only their locations — not someone else's.",
    tag: "Franchise-aware",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Insights (coming soon)",
    description: "See how parents discover your classes — views, saves, and engagement. Understand what drives enrolment.",
    tag: "Coming soon",
  },
]

// ── Content control table ──
const CONTENT_CONTROL = [
  { item: "Class schedule & pricing", who: "You", editable: true },
  { item: "Contact info & social links", who: "You", editable: true },
  { item: "Location hours", who: "You", editable: true },
  { item: "Your own photos", who: "You", editable: true },
  { item: "Instructor profiles", who: "You", editable: true },
  { item: "Business description", who: "Shared", editable: "shared" as const },
  { item: "Class descriptions", who: "Shared", editable: "shared" as const },
  { item: "Tags & categories", who: "Tümbo", editable: false },
  { item: "Review summaries", who: "Tümbo", editable: false },
  { item: "Star ratings", who: "Tümbo", editable: false },
  { item: "Search ranking", who: "Tümbo", editable: false },
  { item: "\"Overheard Online\" quotes", who: "Tümbo", editable: false },
]

export default function BusinessLandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (authMode === "register") {
      // Mock: show success
      setSubmitted(true)
    } else {
      // Mock: redirect to dashboard
      window.location.href = "/business/dashboard"
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar (minimal, business-specific) ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50">
        <nav className="flex h-14 items-center justify-between px-5 md:px-8 max-w-[1200px] mx-auto w-full">
          <Link href="/explore" className="flex items-center gap-2.5">
            <img
              className="h-5 object-contain"
              src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
              alt="Tümbo"
            />
            <span className="text-[13px] font-semibold text-gray-400 border-l border-neutral-200 pl-2.5">
              for Business
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setAuthMode("login"); setSubmitted(false) }}
              className="px-3 py-1.5 text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors bg-transparent border-0 cursor-pointer"
            >
              Sign in
            </button>
            <button
              onClick={() => { setAuthMode("register"); setSubmitted(false) }}
              className="px-4 py-1.5 text-[14px] font-medium text-white bg-[var(--tumbo-orange)] hover:opacity-90 rounded-full transition-opacity border-0 cursor-pointer"
            >
              Claim your listing
            </button>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="px-6 pt-24 pb-20">
        <div className="max-w-[720px] mx-auto text-center">
          <FadeInUp>
            <h1 className="text-[48px] md:text-[56px] font-[900] text-gray-900 leading-[1.05] tracking-tight">
              Your classes are already{" "}
              <span className="text-[var(--tumbo-orange)]">on Tümbo</span>.
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.1}>
            <p className="mt-5 text-[17px] text-gray-400 leading-relaxed max-w-[520px] mx-auto">
              We pull in class listings from across the web so parents can discover
              you. Claim your listing to keep your info accurate and reach more families.
            </p>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => { setAuthMode("register"); setSubmitted(false) }}
                className="px-6 py-3 text-[15px] font-semibold text-white bg-[var(--tumbo-orange)] hover:opacity-90 rounded-full transition-opacity border-0 cursor-pointer"
              >
                Claim your listing — free
              </button>
              <a
                href="#how-it-works"
                className="px-5 py-3 text-[15px] font-medium text-gray-500 hover:text-gray-900 transition-colors no-underline"
              >
                Learn more ↓
              </a>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="how-it-works" className="px-6 py-20 bg-neutral-50/60">
        <div className="max-w-[1024px] mx-auto">
          <FadeInUp>
            <h2 className="text-[28px] font-bold text-gray-900 text-center mb-3">
              How it works for providers
            </h2>
            <p className="text-[15px] text-gray-400 text-center max-w-[480px] mx-auto mb-12">
              You handle the facts. We handle the discovery. Parents get an honest, complete picture.
            </p>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <FadeInUp key={i} delay={i * 0.08}>
                <div className="flex flex-col gap-3 p-6 rounded-xl border border-neutral-200 bg-white hover:shadow-sm transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-gray-500">
                      {f.icon}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        f.tag === "You control"
                          ? "bg-emerald-50 text-emerald-600"
                          : f.tag === "Tümbo curates"
                          ? "bg-[var(--tumbo-orange)]/10 text-[var(--tumbo-orange)]"
                          : f.tag === "Franchise-aware"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-neutral-100 text-gray-400"
                      }`}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900">{f.title}</h3>
                  <p className="text-[14px] text-gray-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content Control Table ── */}
      <section className="px-6 py-20">
        <div className="max-w-[640px] mx-auto">
          <FadeInUp>
            <h2 className="text-[24px] font-bold text-gray-900 text-center mb-2">
              What you can and can&apos;t edit
            </h2>
            <p className="text-[14px] text-gray-400 text-center mb-8">
              We believe in editorial honesty. Here&apos;s exactly how content control works.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.1}>
            <div className="rounded-xl border border-neutral-200 overflow-hidden">
              {CONTENT_CONTROL.map((row, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-5 py-3.5 ${
                    i > 0 ? "border-t border-neutral-100" : ""
                  }`}
                >
                  <span className="text-[14px] text-gray-700">{row.item}</span>
                  <span
                    className={`flex items-center gap-1.5 text-[12px] font-semibold ${
                      row.editable === true
                        ? "text-emerald-600"
                        : row.editable === "shared"
                        ? "text-[var(--tumbo-orange)]"
                        : "text-gray-400"
                    }`}
                  >
                    {row.editable === true ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : row.editable === "shared" ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    )}
                    {row.who}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> You control
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--tumbo-orange)]" /> Shared (you edit, we review)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300" /> Tümbo editorial
              </span>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-16 bg-gray-900">
        <div className="max-w-[520px] mx-auto text-center">
          <h2 className="text-[24px] font-bold text-white mb-3">
            Ready to claim your listing?
          </h2>
          <p className="text-[15px] text-gray-400 mb-6">
            It&apos;s free. Takes 2 minutes. Keeps your info accurate for
            thousands of parents browsing Tümbo.
          </p>
          <button
            onClick={() => { setAuthMode("register"); setSubmitted(false) }}
            className="px-6 py-3 text-[15px] font-semibold text-gray-900 bg-white hover:bg-neutral-100 rounded-full transition-colors border-0 cursor-pointer"
          >
            Get started
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-8 border-t border-neutral-100">
        <div className="max-w-[1024px] mx-auto flex items-center justify-between text-[12px] text-gray-400">
          <span>© {new Date().getFullYear()} Tümbo</span>
          <Link href="/explore" className="hover:text-gray-600 transition-colors no-underline text-gray-400">
            ← Back to Tümbo for parents
          </Link>
        </div>
      </footer>

      {/* ── Auth Slide-over ── */}
      {authMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[3px] animate-in fade-in duration-200"
            onClick={() => setAuthMode(null)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-[420px] rounded-xl bg-white shadow-2xl ring-1 ring-black/[0.05] animate-in zoom-in-95 fade-in duration-200">
            {/* Close */}
            <button
              onClick={() => setAuthMode(null)}
              className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors z-10 bg-transparent border-0 cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col gap-5 p-6 pt-8">
              {/* Header */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2">
                  <img
                    src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                    alt="Tümbo"
                    className="h-4 object-contain"
                  />
                  <span className="text-[11px] font-semibold text-gray-400 border-l border-neutral-200 pl-2">
                    for Business
                  </span>
                </div>
                <h2 className="text-[20px] font-bold text-gray-900 mt-1">
                  {submitted
                    ? "You're on the list"
                    : authMode === "login"
                    ? "Provider sign in"
                    : "Claim your listing"}
                </h2>
                {!submitted && (
                  <p className="text-[13px] text-gray-400 max-w-[280px]">
                    {authMode === "login"
                      ? "Sign in to manage your class listings."
                      : "Tell us your business name and we'll find your listing."}
                  </p>
                )}
              </div>

              {submitted ? (
                /* ── Success state ── */
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                    <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[15px] font-semibold text-gray-900 mb-1">
                      We&apos;ll be in touch
                    </p>
                    <p className="text-[13px] text-gray-400 leading-relaxed max-w-[280px]">
                      We&apos;re verifying your listing. You&apos;ll get an email at{" "}
                      <span className="font-medium text-gray-600">{email}</span>{" "}
                      once your account is ready.
                    </p>
                  </div>
                  <button
                    onClick={() => setAuthMode(null)}
                    className="mt-2 px-5 py-2.5 rounded-full bg-[var(--tumbo-orange)] text-white text-[14px] font-medium hover:opacity-90 transition-opacity border-0 cursor-pointer"
                  >
                    Got it
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {authMode === "register" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-gray-700">
                        Business name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Art Studio Kids"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        className="h-11 rounded-lg border border-neutral-200 bg-white px-3.5 text-[14px] text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 focus:border-[var(--tumbo-orange)]/40 transition-all"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-gray-700">
                      {authMode === "register" ? "Your work email" : "Email"}
                    </label>
                    <input
                      type="email"
                      placeholder={authMode === "register" ? "you@yourbusiness.com" : "you@example.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 rounded-lg border border-neutral-200 bg-white px-3.5 text-[14px] text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 focus:border-[var(--tumbo-orange)]/40 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={authMode === "register" ? "Create a password" : "Enter your password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 pr-10 text-[14px] text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 focus:border-[var(--tumbo-orange)]/40 transition-all"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer"
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {authMode === "register" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-gray-700">
                        How many locations do you manage?
                      </label>
                      <div className="flex gap-2">
                        {["1", "2–3", "4+"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className="flex-1 py-2 rounded-lg border border-neutral-200 text-[13px] font-medium text-gray-600 hover:border-neutral-400 hover:bg-neutral-50 transition-all cursor-pointer bg-white focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 focus:border-[var(--tumbo-orange)]/40"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="h-11 w-full rounded-lg bg-[var(--tumbo-orange)] text-white text-[14px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all border-0 cursor-pointer mt-1"
                  >
                    {authMode === "login" ? "Sign in" : "Claim my listing"}
                  </button>

                  <div className="text-center text-[13px] text-gray-400">
                    {authMode === "login" ? (
                      <>
                        Need to claim a listing?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthMode("register")}
                          className="font-semibold text-[var(--tumbo-orange)] hover:underline bg-transparent border-0 cursor-pointer"
                        >
                          Get started
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthMode("login")}
                          className="font-semibold text-[var(--tumbo-orange)] hover:underline bg-transparent border-0 cursor-pointer"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
