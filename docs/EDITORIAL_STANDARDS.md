# Editorial standards — good enough vs not good enough

This doc defines the distinction between listings we show and ones we hide or treat as "not good enough."

---

## Two kinds of "hidden" (flagged)

Classes in **docs/FLAGGED_CLASS_IDS.json** are hidden from the directory (`hidden_from_directory = true`). Each entry has a **`hide_reason`** so we can tell why:

| hide_reason     | Meaning |
|-----------------|--------|
| **out_of_scope** | Not suitable for a kids enrichment directory (e.g. JC, Poly, University, adult education). |
| **bare_content** | In scope for kids, but content doesn’t meet our editorial bar (no proper summary/vibe subsections). |

- **reason** (text): Human-readable explanation; keep it for review and docs.
- **hide_reason** (code): Use in scripts to filter or report by type (e.g. "how many hidden for bare content?").

Both types are hidden the same way in the app; the distinction is for auditing and consistency.

---

## "Good enough" to show (editorial standard)

A class is **good enough** only if it has **subsection-style content** that we agreed on: not just a short description, but "What parents say," vibe line, and enough substance.

**In code** (see **scripts/enrichment-status.js**):

- **meetsEditorialStandard(cls)** (positive bar):
  - `description` length ≥ 150
  - `summary` length ≥ 80 (What parents say)
  - `vibe_line` length ≥ 20

- **needsEnrichment(cls)** (negative bar, from full-enrich.js): no template phrases, no generic vibe_line / who_thrives / outcome.

"Done up to standard" = in scope, **and** `!needsEnrichment(cls)` **and** `meetsEditorialStandard(cls)`.

Classes that pass the negative check but fail the positive bar (e.g. description only, no summary/vibe) are **bare content**. Those can be added to FLAGGED_CLASS_IDS.json with `"hide_reason": "bare_content"` and hidden like the out-of-scope ones.

---

## Summary

| State              | Meaning |
|--------------------|--------|
| **Good enough**     | In scope, no bad patterns, has description + summary + vibe_line (min lengths). Shown in directory. |
| **Bare content**   | In scope, no bad patterns, but missing/weak summary or vibe. Hide; add to flagged list with `hide_reason: "bare_content"`. |
| **Need rewrite**   | Fails needsEnrichment (template/generic). Run full-enrich.js. |
| **Out of scope**   | Not kids enrichment (JC, Poly, etc.). Hide; in flagged list with `hide_reason: "out_of_scope"`. |
