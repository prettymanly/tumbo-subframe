# 🎯 Tümbo - Children's Class Directory

A public-facing class directory for children's activities that feels polished, loads fast, and is ready to integrate AI-powered recommendations in later phases.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment template:
   ```bash
   cp env.example .env.local
   ```
4. Add your Supabase credentials to `.env.local`
5. Start development server:
   ```bash
   npm run dev
   ```

**⚠️ IMPORTANT:** Never use Turbopack flag. Always use standard Next.js dev server.

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/               # shadcn/ui components
│   └── subframe/         # Tümbo-specific components
├── lib/
│   └── supabase/         # Supabase client configuration
scripts/
├── schema.sql            # Database schema
└── seed-data.sql         # Sample data for testing
```

## 🗄 Database Setup

1. Create a new Supabase project
2. Run the schema: `scripts/schema.sql`
3. (Optional) Seed with sample data: `scripts/seed-data.sql`

## 🎨 Tech Stack

- **Frontend:** Next.js 15 + React 19, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Styling:** Tailwind CSS with custom design tokens
- **State Management:** React hooks + SWR for fetching

## 📱 Features

### MVP (Phase 1)
- [x] Public class directory with search and filters
- [x] Class detail pages
- [x] Provider profiles
- [x] Basic CMS structure
- [x] Scraping-ready backend

### Future Phases
- [ ] AI-powered recommendations
- [ ] User accounts and favorites
- [ ] Advanced search and filtering
- [ ] Mobile app

## 🚀 Development

### Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to Vercel

### Adding Components
```bash
npx shadcn@latest add [component-name]
```

## 📊 Database Schema

The database is designed with the following key entities:
- **Providers** - Class providers and organizations
- **Classes** - Individual class offerings
- **Tags** - Categorization system (content, experience, philosophy, etc.)
- **Sessions** - Class schedules and timing
- **Collections** - Curated class groupings

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Anonymous read access to public catalog
- User authentication required for personal data

## 📈 Performance Goals

- Landing → first class view: < 20 seconds
- Lighthouse mobile score: > 90
- SEO optimized for organic discovery

## 🤝 Contributing

1. Follow the established workflow in `docs/workflow.md`
2. Use functional programming only (no OOP)
3. Maintain TypeScript strict mode
4. Test thoroughly before submitting

## 📄 License

This project is proprietary to Tümbo.
