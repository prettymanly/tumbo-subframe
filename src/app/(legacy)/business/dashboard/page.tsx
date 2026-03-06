"use client"

import React, { useState } from "react"
import Link from "next/link"
import { FadeInUp } from "@/components/ui/fade-in-up"

// ── Mock vendor data (franchise owner with 2 of 5 locations) ──
const MOCK_VENDOR = {
  name: "Rachel Tan",
  email: "rachel@artstudiokids.com",
  role: "Outlet Owner",
  brand: {
    name: "Art Studio Kids",
    logo: "https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png",
    totalLocations: 5,
  },
  locations: [
    {
      id: "ubi",
      name: "Art Studio Kids — Ubi",
      address: "10 Ubi Crescent, #01-45, Singapore 408564",
      status: "verified" as const,
      classCount: 8,
      views: 342,
      saves: 28,
    },
    {
      id: "bukit-timah",
      name: "Art Studio Kids — Bukit Timah",
      address: "170 Upper Bukit Timah Rd, #B1-12, Singapore 588179",
      status: "verified" as const,
      classCount: 5,
      views: 187,
      saves: 14,
    },
  ],
  otherLocations: [
    "Art Studio Kids — Orchard",
    "Art Studio Kids — Jurong East",
    "Art Studio Kids — Tampines",
  ],
}

// ── Mock classes for a location ──
const MOCK_CLASSES = [
  {
    id: "creative-little-architects",
    name: "Creative Little Architects",
    ageRange: "4–8 yrs",
    schedule: "Sat 10am–12pm",
    price: "$45/session",
    status: "active" as const,
  },
  {
    id: "clay-explorers",
    name: "Clay Explorers",
    ageRange: "5–10 yrs",
    schedule: "Sun 2pm–4pm",
    price: "$50/session",
    status: "active" as const,
  },
  {
    id: "tiny-painters",
    name: "Tiny Painters",
    ageRange: "3–5 yrs",
    schedule: "Wed 4pm–5:30pm",
    price: "$38/session",
    status: "draft" as const,
  },
]

// ── Editable field component ──
function EditableField({
  label,
  value,
  locked,
  lockReason,
  shared,
}: {
  label: string
  value: string
  locked?: boolean
  lockReason?: string
  shared?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)

  if (locked) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-gray-500">{label}</span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Tümbo
          </span>
        </div>
        <p className="text-[14px] text-gray-400 leading-relaxed">{value}</p>
        {lockReason && (
          <p className="text-[11px] text-gray-300 italic">{lockReason}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-medium text-gray-500">{label}</span>
        {shared && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--tumbo-orange)]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Reviewed by Tümbo
          </span>
        )}
        {!shared && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            You control
          </span>
        )}
      </div>
      {editing ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="flex-1 h-9 rounded-lg border border-neutral-200 px-3 text-[14px] text-gray-900 outline-none focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 focus:border-[var(--tumbo-orange)]/40"
            autoFocus
          />
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1.5 rounded-lg bg-[var(--tumbo-orange)] text-white text-[12px] font-semibold hover:opacity-90 transition-opacity border-0 cursor-pointer"
          >
            Save
          </button>
          <button
            onClick={() => { setVal(value); setEditing(false) }}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] font-medium text-gray-500 hover:bg-neutral-50 transition-colors cursor-pointer bg-white"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-left text-[14px] text-gray-700 leading-relaxed hover:text-gray-900 cursor-pointer bg-transparent border-0 p-0 group"
        >
          {val}
          <svg className="w-3 h-3 inline ml-1.5 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default function BusinessDashboard() {
  const [activeLocation, setActiveLocation] = useState(MOCK_VENDOR.locations[0].id)
  const location = MOCK_VENDOR.locations.find((l) => l.id === activeLocation)!

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <nav className="flex h-14 items-center justify-between px-5 md:px-8 max-w-[1200px] mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <Link href="/business" className="flex items-center gap-2.5">
              <img
                className="h-4 object-contain"
                src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                alt="Tümbo"
              />
              <span className="text-[12px] font-semibold text-gray-400 border-l border-neutral-200 pl-2.5">
                Business
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-gray-500">
              {MOCK_VENDOR.name}
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--tumbo-orange)]/10 flex items-center justify-center text-[13px] font-bold text-[var(--tumbo-orange)]">
              {MOCK_VENDOR.name.charAt(0)}
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-[1024px] mx-auto px-6 py-8 flex flex-col gap-8">
        {/* ── Header ── */}
        <FadeInUp>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-[24px] font-bold text-gray-900">
                {MOCK_VENDOR.brand.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                {MOCK_VENDOR.role}
              </span>
            </div>
            <p className="text-[14px] text-gray-400">
              Managing {MOCK_VENDOR.locations.length} of {MOCK_VENDOR.brand.totalLocations} locations
            </p>
          </div>
        </FadeInUp>

        {/* ── Location selector ── */}
        <FadeInUp delay={0.05}>
          <div className="flex flex-col gap-3">
            <h2 className="text-[15px] font-semibold text-gray-700">Your locations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MOCK_VENDOR.locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setActiveLocation(loc.id)}
                  className={`flex flex-col gap-2 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer bg-white ${
                    activeLocation === loc.id
                      ? "border-[var(--tumbo-orange)]/40 ring-1 ring-[var(--tumbo-orange)]/10 shadow-sm"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-gray-900">
                      {loc.name.replace("Art Studio Kids — ", "")}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Verified
                    </span>
                  </div>
                  <span className="text-[12px] text-gray-400">{loc.address}</span>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-1">
                    <span>{loc.classCount} classes</span>
                    <span>{loc.views} views</span>
                    <span>{loc.saves} saves</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Other locations (not owned) */}
            {MOCK_VENDOR.otherLocations.length > 0 && (
              <div className="flex items-center gap-2 text-[12px] text-gray-400 mt-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span>
                  {MOCK_VENDOR.otherLocations.length} other {MOCK_VENDOR.brand.name} locations managed by other franchise owners
                </span>
              </div>
            )}
          </div>
        </FadeInUp>

        {/* ── Location detail ── */}
        <FadeInUp delay={0.1}>
          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h2 className="text-[16px] font-bold text-gray-900">
                {location.name}
              </h2>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Editable fields */}
              <EditableField
                label="ADDRESS"
                value={location.address}
              />
              <EditableField
                label="PHONE"
                value="+65 6789 1234"
              />
              <EditableField
                label="EMAIL"
                value="ubi@artstudiokids.com"
              />
              <EditableField
                label="WEBSITE"
                value="https://artstudiokids.com"
              />
              <EditableField
                label="OPENING HOURS"
                value="Mon–Fri 10am–7pm, Sat–Sun 9am–6pm"
              />
              <EditableField
                label="DESCRIPTION"
                value="A creative haven for young artists in the heart of Ubi. Art Studio Kids offers hands-on classes in drawing, painting, ceramics, and mixed media for children aged 3–12."
                shared
              />

              {/* Locked fields */}
              <div className="border-t border-neutral-100 pt-6">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Tümbo editorial — not editable
                </p>
                <div className="flex flex-col gap-5">
                  <EditableField
                    label="TAGS"
                    value="Hands-on · Small group · Creative · Visual learner · Project-based · Imaginative"
                    locked
                    lockReason="Tags are generated by Tümbo from reviews and class analysis."
                  />
                  <EditableField
                    label="REVIEW SUMMARY"
                    value="Parents love the patient instructors and mess-friendly environment. Several mention their shy kids opening up after just 2–3 sessions. A few note parking can be tricky on weekends."
                    locked
                    lockReason="Aggregated from Google Reviews, Facebook, and forum mentions."
                  />
                  <EditableField
                    label="STAR RATING"
                    value="4.6 ★ (from 127 reviews across 3 platforms)"
                    locked
                    lockReason="Calculated from Google, Facebook, and other verified sources."
                  />
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* ── Classes ── */}
        <FadeInUp delay={0.15}>
          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[16px] font-bold text-gray-900">Classes</h2>
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[12px] font-medium text-gray-500">
                  {MOCK_CLASSES.length}
                </span>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-[var(--tumbo-orange)] text-white text-[12px] font-semibold hover:opacity-90 transition-opacity border-0 cursor-pointer">
                + Add class
              </button>
            </div>

            <div className="divide-y divide-neutral-100">
              {MOCK_CLASSES.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-gray-900">
                        {cls.name}
                      </span>
                      {cls.status === "draft" && (
                        <span className="px-1.5 py-[1px] rounded-full bg-[var(--tumbo-cream)] text-[var(--tumbo-orange)] text-[9px] font-bold uppercase tracking-wider">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-gray-400">
                      <span>{cls.ageRange}</span>
                      <span>{cls.schedule}</span>
                      <span>{cls.price}</span>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-neutral-100 transition-colors bg-transparent border-0 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>

        {/* ── Insights placeholder ── */}
        <FadeInUp delay={0.2}>
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-[15px] font-semibold text-gray-500">
                Insights & Analytics
              </h3>
              <p className="text-[13px] text-gray-400 max-w-sm">
                Detailed views, saves, click-throughs, and parent engagement data coming soon.
              </p>
              <span className="px-2 py-0.5 rounded-full bg-[var(--tumbo-orange)]/10 text-[var(--tumbo-orange)] text-[10px] font-bold uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
