"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const NAV_ITEMS = [
  { href: "/", label: "Explore" },
  { href: "/about", label: "About" },
  { href: "/saved", label: "Saved" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", gap: 6, fontFamily: PAGE_FONT }}>
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive =
          href === "/"
            ? pathname === "/" || pathname.startsWith("/class/")
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className="btn-press"
            style={{
              padding: "6px 14px",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "#fff" : "rgba(0,0,0,0.5)",
              background: isActive ? "var(--tumbo-text)" : "transparent",
              textDecoration: "none",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
