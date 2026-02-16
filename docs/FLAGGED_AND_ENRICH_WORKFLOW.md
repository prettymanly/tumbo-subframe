# Flagged entries & enrichment workflow

**Do not run full enrichment on all classes until you have reviewed and applied the flagged list.** This avoids spending on out-of-scope entries (e.g. JC, Poly, Uni).

---

## 1. One-time: add the hidden column

In **Supabase → SQL Editor**, run:

```sql
-- From: tumbo-subframe/scripts/migrations/add-hidden-from-directory.sql
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS hidden_from_directory boolean NOT NULL DEFAULT false;
```

---

## 2. Analyse and flag out-of-scope entries

```bash
cd tumbo-subframe && node scripts/flag-out-of-scope.js
```

- **Output:** `docs/FLAGGED_OUT_OF_SCOPE.md` (table for review) and `docs/FLAGGED_CLASS_IDS.json` (for the apply script).
- **Rules:** Junior College (JC), Polytechnic, University (NUS, NTU, SMU, etc.), ITE, adult education, corporate training, A-Level, etc. Anything that doesn’t belong on a **kids enrichment** directory.

---

## 3. Review the flagged list

Open **docs/FLAGGED_OUT_OF_SCOPE.md**. Remove any rows you want to keep from the JSON list (edit `docs/FLAGGED_CLASS_IDS.json` and delete those entries), or add new IDs if you want to hide more. The apply script uses the JSON file only.

---

## 4. Apply hidden (after review)

```bash
cd tumbo-subframe && node scripts/apply-flagged-hidden.js
```

Sets `hidden_from_directory = true` for every class in `docs/FLAGGED_CLASS_IDS.json`. They disappear from the directory and provider pages; direct links to a class page will 404.

---

## 5. Run full enrichment on the rest

Only after steps 1–4:

```bash
cd tumbo-subframe && node scripts/full-enrich.js --all
```

- Enriches every **non-placeholder, not hidden** class with the current Chipchase-style prompt (subheads, line breaks, editorial synthesis).
- **Cost:** ~\$8–15 (OpenAI). **Time:** ~30–60+ minutes.
- Hidden classes are skipped so you don’t spend on them.

---

## 6. Show only up-to-standard listings (optional)

After enrichment, you can hide every class that **doesn’t** meet the editorial bar (description + summary + vibe_line min lengths). Then the directory only shows “good enough” content while you review UX and what to do with the rest.

**Order:**

1. **Write for the remaining need-rewrite classes** (no `--all`; only those that still need a GPT rewrite):
   ```bash
   cd tumbo-subframe && node scripts/full-enrich.js
   ```
   - Processes only classes that fail the negative bar (template/generic). Cost: ~\$5–15 (OpenAI). Time: ~30–60+ min depending on count. Check status first: `node scripts/enrichment-status.js`.

2. **Hide all that don’t meet the standard** (bare content):
   ```bash
   cd tumbo-subframe && node scripts/hide-bare-content.js --confirm
   ```
   - Sets `hidden_from_directory = true` for every class that fails the positive bar (see docs/EDITORIAL_STANDARDS.md). Writes `docs/HIDDEN_BARE_CONTENT_IDS.json` for later review.

Result: the site only shows classes that meet the editorial standard. You can tweak UX and later decide what to do with the hidden ones (re-enrich, un-hide selectively, etc.).

---

## Summary

| Step | Command / action |
|------|-------------------|
| Add column | Run `add-hidden-from-directory.sql` in Supabase once |
| Flag | `node scripts/flag-out-of-scope.js` |
| Review | Check `docs/FLAGGED_OUT_OF_SCOPE.md`, edit `FLAGGED_CLASS_IDS.json` if needed |
| Hide | `node scripts/apply-flagged-hidden.js` |
| Enrich remaining | `node scripts/full-enrich.js` (only need-rewrite) |
| Hide bare | `node scripts/hide-bare-content.js --confirm` (then site = up-to-standard only) |
| Enrich all | `node scripts/full-enrich.js --all` (optional) |

The app and `full-enrich.js` already filter on `hidden_from_directory` (after the column exists).
