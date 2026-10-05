# Next Task

## Goal
Implement Sales Execution Module (Follow-ups, Activity Logging & Reminders) with daily due list, overdue counter, quick complete modal with next step scheduling, activity feed integration, and Vitest test coverage.

## Relevant Files
- `src/lib/schemas/follow-up.ts` — Zod validation schemas for follow-ups (type, due_date, priority, status)
- `src/lib/actions/follow-ups.ts` — Server Actions (getFollowUps, completeFollowUp, createFollowUp, rescheduleFollowUp)
- `src/components/follow-ups/` — UI components:
  - `follow-up-card.tsx`
  - `follow-ups-list.tsx`
  - `create-follow-up-dialog.tsx`
  - `complete-follow-up-dialog.tsx`
  - `follow-ups-filter.tsx`
- `src/app/(authenticated)/follow-ups/page.tsx` — follow-ups management dashboard
- `src/lib/schemas/__tests__/follow-up.test.ts` — unit tests for follow-up schemas
- `src/lib/actions/__tests__/follow-ups.test.ts` — unit tests for follow-up actions
- `messages/ar.json`, `messages/en.json` — follow-ups translations

## Acceptance Criteria
- List follow-ups partitioned into: Overdue (🚨 متأخرة), Today (📅 اليوم), and Upcoming (🔜 القادمة)
- Support follow-up types: CALL (اتصال), MEETING (اجتماع), WHATSAPP (واتساب), EMAIL (إيميل), VISIT (زيارة)
- Direct action buttons (call phone, launch WhatsApp with prefilled client contact)
- Complete follow-up modal capturing result notes and optionally scheduling the next follow-up in one click
- Log corresponding activity into `activities` table automatically
- Clean TypeScript strict mode, 0 ESLint warnings, all Vitest tests passing, production build passing

## Commands After Completion
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
