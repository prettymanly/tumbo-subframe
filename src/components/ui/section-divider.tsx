// ── Section divider — editorial breathing between content zones ──
// Pure presentational. No logic, no data.

interface SectionDividerProps {
  /** "standard" = thin cream line. "editorial" = thicker, more padding. */
  variant?: "standard" | "editorial";
}

export function SectionDivider({ variant = "standard" }: SectionDividerProps) {
  if (variant === "editorial") {
    return (
      <div className="w-full px-4 md:px-6 lg:px-10 py-4 md:py-6">
        <hr className="border-t-2 border-tumbo-cream" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 lg:px-10 py-2 md:py-3">
      <hr className="border-t border-tumbo-cream" />
    </div>
  );
}
