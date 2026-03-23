"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const MOCK_SAVED = [
  { id: "creative-little-architects", title: "Creative Little Architects", provider: "Art Studio Kids", location: "Ubi" },
  { id: "clay-explorers", title: "Clay Explorers", provider: "Art Studio Kids", location: "Bukit Timah" },
  { id: "nature-discovery", title: "Nature Discovery", provider: "Little Green Lab", location: "Botanic Gardens" },
  { id: "music-movement", title: "Music & Movement", provider: "Harmony Kids", location: "Orchard" },
];

export default function SavedPage() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>
          Sign in to save your favourites
        </h2>
        <p style={{ fontSize: 14, color: "var(--tumbo-label)", margin: "0 0 24px" }}>
          Bookmark classes you love and access them anytime.
        </p>
        <Link
          href="/explore"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            borderRadius: 100,
            background: "var(--tumbo-orange)",
            color: "#fff",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Browse classes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>
        Saved Classes
      </h1>
      <p style={{ fontSize: 14, color: "var(--tumbo-label)", margin: "0 0 32px" }}>
        Classes you&apos;ve bookmarked for later.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {MOCK_SAVED.map((cls) => (
          <Link
            key={cls.id}
            href={`/class/${cls.id}`}
            style={{
              display: "block",
              padding: 20,
              borderRadius: 16,
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              textDecoration: "none",
              color: "inherit",
              transition: "box-shadow 0.15s",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--tumbo-text)", marginBottom: 4 }}>
              {cls.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--tumbo-label)" }}>
              {cls.provider} &middot; {cls.location}
            </div>
          </Link>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "var(--tumbo-label)", marginTop: 40, textAlign: "center" }}>
        More personalisation coming soon
      </p>
    </div>
  );
}
