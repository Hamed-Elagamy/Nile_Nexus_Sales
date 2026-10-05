# Next Task

## Goal
Implement Client Management (`COMPANY` and `INDIVIDUAL` client types) with multiple Contacts per client, duplicate detection, search/filtering, detail page with contacts & deals tabs, Server Actions with ownership-aware RLS, and Vitest coverage.

## Relevant Files
- `src/lib/schemas/client.ts` — Zod validation schemas for clients and contacts
- `src/lib/actions/clients.ts` — Server Actions (getClients, getClientById, createClient, updateClient, addContact, updateContact, convertPotentialClientToClient)
- `src/components/clients/` — UI components:
  - `client-type-badge.tsx`
  - `clients-table.tsx`
  - `clients-filter.tsx`
  - `create-client-dialog.tsx`
  - `client-detail.tsx`
  - `contacts-list.tsx`
  - `add-contact-dialog.tsx`
- `src/app/(authenticated)/clients/page.tsx` — clients directory page
- `src/app/(authenticated)/clients/[id]/page.tsx` — client profile page
- `src/lib/schemas/__tests__/client.test.ts` — unit tests for client schemas
- `src/lib/actions/__tests__/clients.test.ts` — unit tests for client actions
- `messages/ar.json`, `messages/en.json` — clients & contacts translations

## Acceptance Criteria
- Support both `COMPANY` and `INDIVIDUAL` client types
- Concurrency-safe business ID generation (`CLIENT-XXXXX`)
- Duplicate detection on phone, email, and company name
- Manage multiple contacts per client with primary contact selection and direct call/WhatsApp buttons
- Conversion flow from Potential Client (`CONVERTED`) into Client record with activity logging
- Responsive desktop table and mobile-optimized card layout
- Clean TypeScript strict mode, 0 ESLint warnings, all Vitest tests passing, production build passing

## Commands After Completion
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
