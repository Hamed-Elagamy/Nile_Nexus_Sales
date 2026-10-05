# Next Task

## Goal
Implement Commercial Proposals & Quotations Module (`/proposals`, `/proposals/new`, `/proposals/[id]`) with dynamic line items calculation, discount handling, immutable versioning upon sending/acceptance, status lifecycle, printable quotation view, and Vitest test coverage.

## Relevant Files
- `src/lib/schemas/proposal.ts` — Zod validation schemas for proposals, line items, and versions
- `src/lib/actions/proposals.ts` — Server Actions (getProposals, getProposalById, createProposal, createProposalVersion, updateProposalVersionStatus)
- `src/components/proposals/` — UI components:
  - `proposal-status-badge.tsx`
  - `proposals-table.tsx`
  - `proposals-filter.tsx`
  - `proposal-builder.tsx`
  - `proposal-detail.tsx`
  - `proposal-print-view.tsx`
- `src/app/(authenticated)/proposals/page.tsx` — proposals directory
- `src/app/(authenticated)/proposals/new/page.tsx` — new proposal wizard
- `src/app/(authenticated)/proposals/[id]/page.tsx` — proposal detail and versions console
- `src/lib/schemas/__tests__/proposal.test.ts` — unit tests for proposal schemas
- `src/lib/actions/__tests__/proposals.test.ts` — unit tests for proposal actions
- `messages/ar.json`, `messages/en.json` — proposal translations

## Acceptance Criteria
- Concurrency-safe business ID generation (`PROP-XXXXX`)
- Line items calculation: quantity * unit_price, subtotal, discount, tax, grand total
- Support immutable versioning (v1, v2...) — once a version is `SENT` or `ACCEPTED`, it is locked and edits spawn a new version
- Printable / shareable quotation sheet suitable for Egyptian clients (Arabic RTL, VAT breakdown, payment terms)
- Finance boundary respected: proposals are commercial offers, not invoices
- Clean TypeScript strict mode, 0 ESLint warnings, all Vitest tests passing, production build passing

## Commands After Completion
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
