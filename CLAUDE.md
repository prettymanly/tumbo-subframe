# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ralph Wiggum Workflow

This project uses the Ralph Wiggum development loop. Before any work:

1. **Read `prd.md`** — what are we building? Find the relevant requirement/page/feature ID.
2. **Read `progress.md`** — where are we? What's done, blocked, next?
3. **Pick the next task** from progress.md that traces back to a prd.md requirement.
4. **Build it** — small, focused increment.
5. **Update `progress.md`** — mark done, add session log entry, update "Next Up" if needed.
6. **Loop.**

Reference `styleguide.md` for design tokens, colors, typography, and component patterns before building any UI.

## Project Overview

Tumbo is a public-facing class directory for children's activities in Singapore. Built with Next.js 15, React 19, Tailwind CSS, and Supabase. See `prd.md` for full requirements.

## Development Commands

```bash
npm install                          # Install dependencies
npm run dev                          # Dev server (NEVER use --turbopack)
npm run build                        # Production build
npm run lint                         # Run linter
npm run start                        # Production server
npx shadcn@latest add [component]    # Add shadcn/ui components
```

## Critical Rules

- **NEVER use Turbopack** — causes severe caching issues
- **Functional programming only** — React hooks and functional components, no OOP
- **TypeScript strict mode** — no `any` types, proper interfaces
- **Server components first** — use Next.js App Router server components where possible
- **Never commit secrets** — no API keys, no `.env.local`

## Architecture

```
src/app/                    # Next.js App Router pages
src/components/ui/          # shadcn/ui + custom Tumbo components
src/components/subframe/ui/ # Subframe design system (62 components)
src/contexts/               # React contexts (AuthContext)
src/lib/supabase/           # Supabase clients (client.ts, server.ts, tags.ts)
src/lib/types/              # TypeScript type definitions
src/theme/                  # Design tokens (tokens.ts)
scripts/                    # SQL schema, seeds, tag data
public/photos/              # Static image assets
```

### Path Aliases
- `@/*` → `./src/*`
- `@/ui/*` → `./src/components/subframe/ui/*`

### Environment
Copy `env.example` to `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Key Documents

| File | Purpose |
|------|---------|
| `prd.md` | What to build — requirements, features, pages, phases |
| `progress.md` | Where we are — completed, in-progress, blocked, next |
| `styleguide.md` | How it looks — design tokens, colors, typography, components |