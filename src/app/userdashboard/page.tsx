"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ModernPageLayout } from "@/components/ui/modern-page-layout"
import { FadeInUp } from "@/components/ui/fade-in-up"
import { Modal } from "@/components/ui/modal"
import { useAuth } from "@/contexts/AuthContext"

// ── Cartoon avatars (DiceBear API — no auth needed) ──
const CARTOON_AVATARS = [
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Sarah&backgroundColor=b6e3f4",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Alex&backgroundColor=c0aede",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Maya&backgroundColor=ffd5dc",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Chris&backgroundColor=d1f4d1",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Luna&backgroundColor=ffe8b6",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Milo&backgroundColor=b6e3f4",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Zara&backgroundColor=ffd5dc",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Noah&backgroundColor=c0aede",
]

// ── Alphabet avatar colors ──
const ALPHA_COLORS = [
  "#E8927C", // warm coral
  "#7CB8E8", // soft blue
  "#A8D5A2", // sage green
  "#D4A0D4", // lavender
  "#E8C97C", // warm gold
  "#7CD4D4", // teal
]

// ── Mock bookmarked class data (will come from Supabase in Step 2) ──
const MOCK_BOOKMARKED_CLASSES = [
  {
    id: "creative-little-architects",
    title: "Creative Little Architects",
    provider: "Art Studio Kids",
    location: "Ubi",
    ageRange: "4–8 yrs",
    image:
      "https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png",
    slug: "/classes/creative-little-architects",
  },
  {
    id: "clay-explorers",
    title: "Clay Explorers",
    provider: "Art Studio Kids",
    location: "Bukit Timah",
    ageRange: "5–10 yrs",
    image:
      "https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png",
    slug: "/classes/clay-explorers",
  },
  {
    id: "nature-discovery",
    title: "Nature Discovery",
    provider: "Little Green Lab",
    location: "Botanic Gardens",
    ageRange: "3–7 yrs",
    image:
      "https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png",
    slug: "/classes/nature-discovery",
  },
  {
    id: "music-movement",
    title: "Music & Movement",
    provider: "Harmony Kids",
    location: "Orchard",
    ageRange: "2–5 yrs",
    image:
      "https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png",
    slug: "/classes/music-movement",
  },
]

// ── Edit Profile Modal ──
function EditProfileModal({
  open,
  onClose,
  currentName,
  currentAvatar,
  onSave,
}: {
  open: boolean
  onClose: () => void
  currentName: string
  currentAvatar?: string
  onSave: (name: string, avatar: string) => void
}) {
  const [name, setName] = useState(currentName)
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "")
  const [avatarType, setAvatarType] = useState<"cartoon" | "alpha" | "upload">(
    "cartoon"
  )
  const nameRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Reset when opening
  useEffect(() => {
    if (open) {
      setName(currentName)
      setSelectedAvatar(currentAvatar || "")
      // Detect avatar type
      if (currentAvatar?.startsWith("data:")) {
        setAvatarType("upload")
      } else if (currentAvatar?.includes("dicebear")) {
        setAvatarType("cartoon")
      } else if (!currentAvatar) {
        setAvatarType("alpha")
      } else {
        setAvatarType("cartoon")
      }
      setTimeout(() => nameRef.current?.focus(), 100)
    }
  }, [open, currentName, currentAvatar])

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim(), selectedAvatar)
    onClose()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    if (file.size > 2 * 1024 * 1024) return // 2MB limit

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setSelectedAvatar(dataUrl)
      setAvatarType("upload")
    }
    reader.readAsDataURL(file)
  }

  const initial = name?.charAt(0)?.toUpperCase() || "?"

  // Preview renderer
  const renderPreview = () => {
    if (selectedAvatar?.startsWith("data:")) {
      // Uploaded image
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={selectedAvatar}
          alt=""
          className="w-20 h-20 rounded-full object-cover ring-2 ring-[var(--tumbo-orange)]/20"
        />
      )
    }
    if (selectedAvatar?.includes("dicebear")) {
      // Cartoon SVG
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={selectedAvatar}
          alt=""
          className="w-20 h-20 rounded-full ring-2 ring-[var(--tumbo-orange)]/20 bg-white"
        />
      )
    }
    // Alphabet initial
    const colorIndex =
      initial.charCodeAt(0) % ALPHA_COLORS.length
    return (
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-[28px] font-bold text-white ring-2 ring-[var(--tumbo-orange)]/20"
        style={{ backgroundColor: ALPHA_COLORS[colorIndex] }}
      >
        {initial}
      </div>
    )
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-5 p-6 pt-8">
        <div className="text-center">
          <h2 className="text-[18px] font-bold text-gray-900">Edit profile</h2>
          <p className="text-[13px] text-gray-400 mt-1">
            Update your name and profile picture.
          </p>
        </div>

        {/* Preview */}
        <div className="flex justify-center">{renderPreview()}</div>

        {/* Avatar type tabs */}
        <div className="flex rounded-lg bg-neutral-100 p-1 gap-0.5">
          {(
            [
              { key: "cartoon", label: "Cartoon" },
              { key: "alpha", label: "Initials" },
              { key: "upload", label: "Upload" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setAvatarType(key)
                if (key === "alpha") setSelectedAvatar("")
                if (key === "cartoon" && !selectedAvatar?.includes("dicebear"))
                  setSelectedAvatar(CARTOON_AVATARS[0])
              }}
              className={`flex-1 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-150 border-0 cursor-pointer ${
                avatarType === key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "bg-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Avatar options based on type */}
        <div className="min-h-[56px]">
          {avatarType === "cartoon" && (
            <div className="flex flex-wrap justify-center gap-2.5">
              {CARTOON_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedAvatar(url)}
                  className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-all duration-150 cursor-pointer p-0.5 ${
                    selectedAvatar === url
                      ? "border-[var(--tumbo-orange)] ring-2 ring-[var(--tumbo-orange)]/20"
                      : "border-neutral-200 hover:border-neutral-400 bg-white"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Cartoon avatar ${i + 1}`}
                    className="w-full h-full rounded-full"
                  />
                </button>
              ))}
            </div>
          )}

          {avatarType === "alpha" && (
            <div className="flex flex-wrap justify-center gap-2.5">
              {ALPHA_COLORS.map((color, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar("")
                  }}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-150 cursor-pointer text-[16px] font-bold text-white ${
                    !selectedAvatar &&
                    ALPHA_COLORS[initial.charCodeAt(0) % ALPHA_COLORS.length] ===
                      color
                      ? "border-[var(--tumbo-orange)] ring-2 ring-[var(--tumbo-orange)]/20"
                      : "border-transparent hover:border-neutral-300"
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {initial}
                </button>
              ))}
            </div>
          )}

          {avatarType === "upload" && (
            <div className="flex flex-col items-center gap-3">
              {selectedAvatar?.startsWith("data:") ? (
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-gray-500">
                    Image uploaded
                  </span>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="text-[13px] font-semibold text-[var(--tumbo-orange)] hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center gap-2 w-full py-6 rounded-xl border-2 border-dashed border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50 transition-all duration-150 cursor-pointer bg-transparent"
                >
                  <svg
                    className="w-6 h-6 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span className="text-[13px] font-medium text-gray-400">
                    Upload a photo
                  </span>
                  <span className="text-[11px] text-gray-300">
                    JPG, PNG up to 2MB
                  </span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Display name
          </label>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Your name"
            className="h-11 rounded-lg border border-neutral-200 bg-white px-3.5 text-[14px] text-gray-900 placeholder-gray-300 outline-none transition-all duration-150 focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 focus:border-[var(--tumbo-orange)]/40"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-neutral-200 text-[14px] font-medium text-gray-600 hover:bg-neutral-50 transition-colors duration-150 cursor-pointer bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 h-10 rounded-lg bg-[var(--tumbo-orange)] text-[14px] font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function UserDashboard() {
  const { user, isAuthenticated, updateProfile } = useAuth()
  const [editProfileOpen, setEditProfileOpen] = useState(false)

  // Not signed in
  if (!isAuthenticated || !user) {
    return (
      <ModernPageLayout>
        <div className="flex w-full flex-col items-center justify-center py-32 px-6">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
            <h1 className="text-[22px] font-bold text-gray-900">
              Sign in to save your favourites
            </h1>
            <p className="text-[14px] text-gray-400 leading-relaxed">
              Bookmark classes you love and access them anytime. More
              personalisation features are coming soon.
            </p>
            <Link
              href="/classes"
              className="mt-2 px-5 py-2.5 rounded-full bg-[var(--tumbo-orange)] text-white text-[14px] font-medium hover:opacity-90 transition-opacity no-underline"
            >
              Browse classes
            </Link>
          </div>
        </div>
      </ModernPageLayout>
    )
  }

  const bookmarks = MOCK_BOOKMARKED_CLASSES

  const handleProfileSave = (name: string, avatar: string) => {
    updateProfile({ name, avatar: avatar || undefined })
  }

  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-center bg-default-background">
        <div className="w-full max-w-[1024px] px-6 py-10 flex flex-col gap-10">
          {/* ── Greeting + Profile ── */}
          <FadeInUp>
            <div className="flex items-center gap-4">
              {/* Clickable avatar */}
              <button
                type="button"
                onClick={() => setEditProfileOpen(true)}
                className="relative group cursor-pointer bg-transparent border-0 p-0 flex-shrink-0"
                aria-label="Edit profile picture"
              >
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-neutral-100 group-hover:ring-[var(--tumbo-orange)]/30 transition-all duration-200 bg-white"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white group-hover:ring-2 group-hover:ring-[var(--tumbo-orange)]/30 transition-all duration-200"
                    style={{
                      backgroundColor:
                        ALPHA_COLORS[
                          (user.name?.charAt(0)?.toUpperCase() || "U").charCodeAt(0) %
                            ALPHA_COLORS.length
                        ],
                    }}
                  >
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                {/* Edit overlay */}
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                    />
                  </svg>
                </div>
              </button>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-[24px] font-bold text-gray-900">
                    Hey, {user.name?.split(" ")[0] || "there"}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setEditProfileOpen(true)}
                    className="p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-neutral-100 transition-all duration-150 bg-transparent border-0 cursor-pointer"
                    aria-label="Edit profile"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-[14px] text-gray-400">
                  Here are your saved classes.
                </p>
              </div>
            </div>
          </FadeInUp>

          {/* ── Favourited Classes ── */}
          <FadeInUp delay={0.1}>
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <svg
                    className="w-5 h-5 text-[var(--tumbo-orange)]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                  <h2 className="text-[18px] font-bold text-gray-900">
                    Saved Classes
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[12px] font-medium text-gray-500">
                    {bookmarks.length}
                  </span>
                </div>
                <Link
                  href="/classes"
                  className="text-[13px] font-semibold text-[var(--tumbo-orange)] hover:underline no-underline"
                >
                  Browse more →
                </Link>
              </div>

              {bookmarks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarks.map((cls) => (
                    <Link
                      key={cls.id}
                      href={cls.slug}
                      className="group flex flex-col rounded-xl border border-neutral-200 bg-white overflow-hidden hover:shadow-md hover:border-neutral-300 transition-all duration-250 no-underline"
                    >
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={cls.image}
                          alt={cls.title}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                        {/* Bookmark icon */}
                        <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                          <svg
                            className="w-3.5 h-3.5 text-[var(--tumbo-orange)] fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                          </svg>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="flex flex-col gap-1.5 p-4">
                        <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-1">
                          {cls.title}
                        </h3>
                        <p className="text-[13px] text-gray-400">
                          {cls.provider}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                              />
                            </svg>
                            {cls.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                              />
                            </svg>
                            {cls.ageRange}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-16 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[15px] font-medium text-gray-500">
                      No saved classes yet
                    </p>
                    <p className="text-[13px] text-gray-400 mt-1">
                      Bookmark classes you like and they&apos;ll show up here.
                    </p>
                  </div>
                  <Link
                    href="/classes"
                    className="mt-1 px-4 py-2 rounded-full bg-[var(--tumbo-orange)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity no-underline"
                  >
                    Browse classes
                  </Link>
                </div>
              )}
            </div>
          </FadeInUp>

          {/* ── Coming Soon teaser ── */}
          <FadeInUp delay={0.2}>
            <div className="flex flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-6">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-gray-700">
                  More personalisation coming soon
                </span>
                <span className="px-1.5 py-[1px] rounded-full bg-[var(--tumbo-orange)]/10 text-[var(--tumbo-orange)] text-[9px] font-bold uppercase tracking-wider leading-none">
                  Soon
                </span>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed max-w-lg">
                Child profiles, learning signatures, personalised
                recommendations, and class tracking — all coming in a future
                update. For now, save your favourites and browse at your own
                pace.
              </p>
            </div>
          </FadeInUp>
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      <EditProfileModal
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        currentName={user.name}
        currentAvatar={user.avatar}
        onSave={handleProfileSave}
      />
    </ModernPageLayout>
  )
}
