# Next Task

## Goal
Production Deployment & Live Supabase Environment Connection:
Connect live Supabase project credentials in `.env.local`, apply database migrations (`supabase/migrations/001_initial_schema.sql`, `002_rls_policies.sql`, `003_seed_data.sql`), create the initial GM/Admin user account, and launch into production on Vercel.

## Relevant Files
- `.env.local` — live environment credentials
- `supabase/migrations/001_initial_schema.sql` — PostgreSQL database schema
- `supabase/migrations/002_rls_policies.sql` — Row Level Security policies
- `supabase/migrations/003_seed_data.sql` — initial pipelines and catalog data
- `docs/DEPLOYMENT.md` — full deployment and production checklist

## Acceptance Criteria
- Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
- Database initialized with all 30+ tables and RLS security policies
- Initial Admin/GM profile created in Supabase Auth
- Application deployed on Vercel with automatic CI/CD from `main` branch
- Zero build errors, zero TypeScript errors, 100% Vitest test pass rate

## Commands To Run Application Locally
```bash
npm run dev
```
