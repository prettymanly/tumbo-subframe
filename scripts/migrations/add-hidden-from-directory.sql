-- Hide out-of-scope entries from the public directory (e.g. JC, Poly, Uni, adult-only).
-- Run once in Supabase SQL editor before using apply-flagged-hidden.js or the app filter.
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS hidden_from_directory boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.classes.hidden_from_directory IS 'When true, class is excluded from directory and provider pages. Set by apply-flagged-hidden.js after reviewing docs/FLAGGED_OUT_OF_SCOPE.md.';
