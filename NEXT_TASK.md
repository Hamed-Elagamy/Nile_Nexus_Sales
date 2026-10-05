# Next Task

## Goal
Implement Team Management (`/team`), Company & Services Settings (`/settings`), and wire live KPI metrics into the Executive Dashboard (`/dashboard`) with Vitest test coverage.

## Relevant Files
- `src/lib/schemas/team.ts` & `src/lib/schemas/settings.ts` — validation schemas for team roles, services, and company settings
- `src/lib/actions/team.ts` — Server Actions (getTeamMembers, updateMemberRole, toggleMemberStatus)
- `src/lib/actions/settings.ts` — Server Actions (getServices, createService, updateService, getLeadSources, createLeadSource)
- `src/lib/actions/dashboard.ts` — Server Action (getDashboardMetrics: pipeline totals, win rate, follow-up alerts, recent activities)
- `src/components/team/` — team directory and role assignment dialog
- `src/components/settings/` — service catalog manager and company settings
- `src/app/(authenticated)/team/page.tsx` — team members management
- `src/app/(authenticated)/settings/page.tsx` — company and catalog configuration
- `src/app/(authenticated)/dashboard/page.tsx` — live executive dashboard
- `src/lib/actions/__tests__/dashboard.test.ts` — unit tests for dashboard metrics aggregation

## Acceptance Criteria
- Team management with role separation (`GM`, `ADMIN`, `SALES`) and activity indicators
- Services catalog management (names in Arabic/English, reference price, active toggle)
- Live dashboard displaying real calculated KPIs:
  - Potential Clients in research pool
  - Active Clients count
  - Open Deals & total pipeline value in EGP
  - Today's pending follow-ups & overdue alert counter
  - Real-time recent activities feed
- Clean TypeScript strict mode, 0 ESLint warnings, all Vitest tests passing, production build passing

## Commands After Completion
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
