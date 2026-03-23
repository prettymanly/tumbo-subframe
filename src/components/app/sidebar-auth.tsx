"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/ui/auth-modal";

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
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--tumbo-text)", whiteSpace: "nowrap" }}>
          {user.name}
        </span>
        <button
          onClick={logout}
          className="btn-press"
          style={{
            padding: "6px 14px",
            background: "transparent",
            border: "none",
            color: "var(--tumbo-label)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button
        onClick={() => {
          setAuthMode("signin");
          setAuthModalOpen(true);
        }}
        className="btn-press"
        style={{
          padding: "6px 14px",
          background: "transparent",
          border: "none",
          color: "var(--tumbo-text)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
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
