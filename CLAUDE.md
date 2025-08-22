# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Tümbo is a public-facing class directory for children's activities built with Next.js 15, React 19, and Supabase. The platform helps parents discover quality children's classes with fast search and filtering capabilities.

## Development Commands
```bash
# Install dependencies
npm install

# Development server (NEVER use --turbopack flag)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Start production server
npm run start

# Add shadcn/ui components
npx shadcn@latest add [component-name]
```

## Critical Rules
- **NEVER use Turbopack** - Always use standard Next.js dev server without `--turbopack` flag
- **Functional programming only** - Use React hooks and functional components, no OOP
- **TypeScript strict mode** - Maintain proper typing for all components and data
- **Server components first** - Use Next.js App Router server components where possible

## Project Architecture

### Directory Structure
- `src/app/` - Next.js App Router pages
- `src/components/ui/` - shadcn/ui components  
- `src/components/subframe/` - Tümbo-specific Subframe design system components
- `src/lib/supabase/` - Supabase client configuration and utilities
- `scripts/` - Database schema and seed data SQL files
- `public/photos/` - Static image assets for classes and collections

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui, Subframe components
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React hooks for local state, SWR for data fetching
- **Styling**: Tailwind CSS with custom design tokens
- **Hosting**: Vercel with edge caching

### Database Schema
The Supabase database includes:
- `providers` - Class providers and organizations
- `classes` - Individual class offerings with details like age range, pricing, location
- `tags` - Multi-dimensional categorization (content, experience, philosophy, child traits)
- `sessions` - Class schedules and timing
- `collections` - Curated class groupings

Tag system supports four categories:
1. Content tags (what is taught)
2. Experience tags (how it's taught)
3. Philosophy tags (provider's approach)
4. Child tags (personality/interest traits)

### Environment Setup
Copy `env.example` to `.env.local` and add:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Path Aliases
- `@/*` maps to `./src/*`
- `@/ui/*` maps to `./src/components/subframe/ui/*`

## Code Quality Guidelines
- No `any` types - maintain TypeScript type safety
- Use Next.js Image component for optimized loading
- Implement lazy loading for secondary content
- Follow existing patterns in neighboring files
- Check package.json before assuming library availability
- Never commit secrets or API keys

## Performance Requirements
- Landing → first class view: < 20 seconds
- Lighthouse mobile score: > 90
- SEO optimized with proper metadata and semantic HTML