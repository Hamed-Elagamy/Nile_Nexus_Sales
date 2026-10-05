# Next Task

## Goal
Initialize shadcn/ui component library, then build the CRM Core: Potential Clients list/create/view pages with Server Actions, Zod validation, and the research workflow status transitions. Connect to Supabase via the existing server client, with proper ownership-aware patterns matching the RLS policies in migration 002.

## Relevant Files
- `src/app/(authenticated)/potential-clients/page.tsx` — list page
- `src/app/(authenticated)/potential-clients/[id]/page.tsx` — detail page
- `src/components/potential-clients/` — UI components
- `src/lib/actions/potential-clients.ts` — Server Actions
- `src/lib/schemas/potential-client.ts` — Zod schemas
- `messages/ar.json`, `messages/en.json` — translations

## Acceptance Criteria
- shadcn/ui components (Button, Input, Card, Dialog, Select, Badge, Textarea, Table, Skeleton) available
- Potential Client list page with search, filter by status, and pagination
- Create Potential Client form with validation
- View/edit Potential Client detail page
- Status transitions: NEW → RESEARCHING → RESEARCHED
- Opportunity indicators support
- All Server Actions use Supabase server client
- TypeScript strict, lint clean, build passes
- At least 2 new test files covering schemas and actions

## Commands After Completion
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
