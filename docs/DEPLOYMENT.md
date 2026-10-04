# Deployment Guide

## Vercel Configuration
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

## Environment Variables List
Required in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_BASE_URL` (for absolute URLs in emails/metadata)

## Supabase Setup Steps
1. Create new project.
2. Link local project: `supabase link --project-ref <ref>`
3. Push migrations: `supabase db push`
4. Deploy edge functions (if any).

## Production Checklist
- [ ] Database migrations applied.
- [ ] RLS policies verified and enabled.
- [ ] Environment variables set in Vercel.
- [ ] Vercel domains configured.

## Domain/DNS Considerations
Setup custom domain via Vercel dashboard. Ensure proper SSL provisioning.
