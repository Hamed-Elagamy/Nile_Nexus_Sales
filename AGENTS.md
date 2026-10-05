# Nile Nexus Sales - Agent Instructions

Concise persistent instructions for any AI agent working on this repo:

## Product Overview
- Product: Nile Nexus Sales — internal sales management platform replacing Excel workflows
- Domain: e:\New Work\Nile_Nexus_Sales
- Remote: https://github.com/Hamed-Elagamy/Nile_Nexus_Sales.git

## Tech Stack
- Frontend: Next.js 15 App Router, React, Tailwind CSS, shadcn/ui, Lucide icons
- Language: TypeScript (strict mode)
- Backend/DB: Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- Validation/Forms: Zod, React Hook Form
- Testing: Vitest, Playwright
- Deployment: Vercel

## Core Architecture & Business Rules
- Arabic (Egyptian colloquial) is DEFAULT language, English secondary.
- RTL/LTR runtime switching is required.
- Three roles: GM, ADMIN, SALES with permission architecture underneath.
- Supabase RLS mandatory on all business tables.
- No hard-delete — use `archived_at` / lifecycle statuses instead.
- UUID internal PKs, separate human-readable business IDs.
- Client ≠ Deal (one client → many deals).
- Proposal versions are immutable once sent/accepted.
- Finance boundary: Sales does NOT create invoices/payments.
- Integration/outbox architecture for future systems.

## Operational & Testing Requirements
- Testing required: Vitest unit/integration, Playwright E2E, RLS tests.
- Never commit `.env`, secrets, or credentials.
- Always maintain `PROJECT_STATE.md`, `NEXT_TASK.md`, `CHANGELOG.md`.

## Agent Workflows
- **Checkpoint Protocol**: finish unit → test → update docs → commit.
- **Resume Protocol**: read `AGENTS.md`, `PROJECT_STATE.md`, `NEXT_TASK.md` before editing.
- Do not claim a task is complete if tests are failing.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
