"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/ui/auth-modal";

const PAGE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export function SidebarAuth() {
  const { user, isAuthenticated, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

  if (isAuthenticated && user) {
    const initials = user.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div style={{ fontFamily: PAGE_FONT, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--tumbo-orange)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tumbo-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--tumbo-label)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn-press"
          style={{
            padding: "6px 0",
            background: "transparent",
            border: "none",
            color: "var(--tumbo-label)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "inherit",
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: PAGE_FONT, display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        onClick={() => {
          setAuthMode("signin");
          setAuthModalOpen(true);
        }}
        className="btn-press"
        style={{
          padding: "8px 0",
          background: "transparent",
          border: "none",
          color: "var(--tumbo-text)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        Sign in
      </button>
      <button
        onClick={() => {
          setAuthMode("register");
          setAuthModalOpen(true);
        }}
        className="btn-press"
        style={{
          padding: "8px 20px",
          borderRadius: 100,
          background: "var(--tumbo-orange)",
          border: "none",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          width: "100%",
        }}
      >
        Sign up
      </button>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </div>
  );
}
