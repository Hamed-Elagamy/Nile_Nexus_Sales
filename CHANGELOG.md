# Changelog

All notable changes to this project will be documented in this file.

## [0.6.0] - 2026-10-05

### Added
- **Live Executive Dashboard**:
  - Server Action (`src/lib/actions/dashboard.ts`):
    - `getDashboardMetrics`: live aggregation of potential clients count, active clients, open pipeline value (EGP), closed won deals value, today's follow-ups, urgent overdue counter, recent activities, and recent deals
  - UI (`/dashboard`):
    - Live KPI cards with direct navigation links
    - Urgent overdue alert banner with instant recovery button
    - Recent deals feed with live stage badges and values
    - Real-time recent commercial activity stream
    - Quick action bar for creating potential clients, deals, and proposals
- **Team Directory & Role Management**:
  - Validation schemas (`src/lib/schemas/team.ts`) for user roles (`GM`, `ADMIN`, `SALES`) and account status toggles
  - Server Actions (`src/lib/actions/team.ts`):
    - `getTeamMembers`: directory with active indicators and deal stats
    - `updateMemberRole`: GM/Admin controlled role assignment
    - `toggleMemberStatus`: user account activation and deactivation
  - UI (`/team`):
    - `TeamMemberCard` with role-specific badges, contact links, and inline role modification
    - `TeamList` with instant search and role filter tabs
- **System & Services Settings**:
  - Validation schemas (`src/lib/schemas/settings.ts`) for services and lead sources
  - Server Actions (`src/lib/actions/settings.ts`):
    - `getServices`, `createService`, `updateService`
    - `getLeadSources`, `createLeadSource`
  - UI (`/settings`):
    - `ServicesCatalog`: catalog table with internal reference prices, currency, active toggling, and service creation modal
    - `LeadSourcesManager`: marketing channel cards and source creation modal
- **Testing**:
  - 60 passing tests across 13 test suites (dashboard aggregation tests included)

## [0.5.0] - 2026-10-05

### Added
- **Commercial Proposals & Quotations Module**:
  - Validation schemas (`src/lib/schemas/proposal.ts`) for line items, financial totals, version cloning, and status transitions
  - Concurrency-safe business ID generation (`PROP-XXXXX`)
  - Server Actions (`src/lib/actions/proposals.ts`):
    - `getProposals`: paginated list with search and status filtering
    - `getProposalById`: full detail view with all versions, line items, and audit history
    - `createProposal`: creation wizard creating initial Version 1, line items, and activity logging
    - `createProposalVersion`: version cloning (v2, v3...) allowing changes requested after sending
    - `updateProposalVersionStatus`: lifecycle transitions with immutability enforcement once accepted/sent
  - UI Components (`src/components/proposals/`):
    - `ProposalStatusBadge`: color-coded lifecycle badges
    - `ProposalBuilder`: dynamic line items manager with real-time subtotal, discount, VAT, and grand total calculations
    - `ProposalPrintView`: printable quotation layout for Egyptian commercial clients with window.print() / PDF support
    - `ProposalDetail`: full console with version tabs, lifecycle buttons, and printable view modal
    - `ProposalsTable`: table of proposals with status, currency, and link to details
    - `ProposalsFilter`: search and status filter tabs
    - `CreateProposalWizard`: wizard for new proposals with client and deal selector
    - `ProposalsClient`: client container
  - Routes:
    - `/proposals`: proposals directory
    - `/proposals/new`: proposal creation wizard
    - `/proposals/[id]`: proposal version details and printing console
  - Testing:
    - 59 passing tests across 12 test suites (proposals schemas and actions included)

## [0.4.0] - 2026-10-05

### Added
- **Sales Execution Module (Follow-ups & Activity Logging)**:
  - Validation schemas (`src/lib/schemas/follow-up.ts`) for follow-up actions, completion results, next-step scheduling, and rescheduling
  - Server Actions (`src/lib/actions/follow-ups.ts`):
    - `getFollowUps`: multi-tab dashboard (TODAY, OVERDUE, UPCOMING, COMPLETED, ALL) with parallel count aggregation
    - `createFollowUp`: new follow-up scheduling with activity logging
    - `completeFollowUp`: quick completion modal with outcome notes and one-click next-step scheduling
    - `rescheduleFollowUp`: date postponement with reason tracking
  - UI Components (`src/components/follow-ups/`):
    - `FollowUpActionBadge`: color-coded badges for CALL, MEETING, WHATSAPP, EMAIL, VISIT
    - `FollowUpCard`: card with urgent overdue highlighting, direct phone call / WhatsApp launcher, and quick completion buttons
    - `FollowUpsFilter`: tab navigation with live counters and action type filtering
    - `CompleteFollowUpDialog`: modal to record outcome notes and immediately schedule the subsequent follow-up
    - `RescheduleFollowUpDialog`: date postponement modal
    - `CreateFollowUpDialog`: modal to schedule new follow-ups with client selector
    - `FollowUpsClient`: interactive client container with empty-state feedback per tab
  - Routes:
    - `/follow-ups`: daily sales execution dashboard
  - Testing:
    - 49 passing tests across 10 test suites (schemas and actions for follow-ups included)

## [0.3.0] - 2026-10-05

### Added
- **Clients & Contacts Module**:
  - Validation schemas (`src/lib/schemas/client.ts`) supporting `COMPANY` and `INDIVIDUAL` types
  - Concurrency-safe business ID generation (`CLIENT-XXXXX`)
  - Server Actions (`src/lib/actions/clients.ts`):
    - `getClients`: search, client-type filtering, sales owner, pagination
    - `getClientById`: full profile with contacts and deals
    - `createClient`: validation, duplicate detection (phone/email/name), activity logging
    - `updateClient`: profile updates and logging
    - `addContact` & `updateContact`: manage multiple contacts per client with primary contact flag
    - `convertPotentialClientToClient`: seamless conversion from research stage to active client + optional initial deal
  - UI Components (`src/components/clients/`):
    - `ClientTypeBadge`, `ClientsFilter`, `ClientsTable`, `CreateClientDialog`, `ContactsList`, `AddContactDialog`, `ClientDetail`, `ClientsClient`
  - Routes:
    - `/clients`: full directory with quick call/WhatsApp buttons
    - `/clients/[id]`: client hub with overview, contacts list, and deals tab
- **Deals & Pipeline Kanban Module**:
  - Validation schemas (`src/lib/schemas/deal.ts`) for deals, stage updates, and lost deal tracking
  - Server Actions (`src/lib/actions/deals.ts`):
    - `getDeals`: paginated search and filters
    - `getPipelineDeals`: Kanban-ready aggregation grouped by stages
    - `getDealById`: detail view with client, services, activities
    - `createDeal`: deal creation with services linkage
    - `updateDeal`: full deal details editing
    - `updateDealStage`: stage transitions, won celebration, lost reason tracking
  - UI Components (`src/components/deals/` & `src/components/pipeline/`):
    - `DealStageBadge`, `DealsFilter`, `DealsTable`, `CreateDealDialog`, `DealDetail`, `DealsClient`
    - `DealCard`: pipeline card with stage advance button and direct actions
    - `PipelineBoard`: horizontal drag/action board with responsive scrolling
    - `LostDealDialog`: modal capturing lost reason, competitor notes, and resurface dates
  - Routes:
    - `/deals`: tabular view of all deals
    - `/deals/[id]`: deal detail page with client links and stage progress
    - `/pipeline`: interactive Kanban board
- **Testing**:
  - 40 passing tests across 8 test suites (including client & deal schemas and actions)

## [0.2.0] - 2026-10-05

### Added
- **shadcn/ui Component Library**:
  - Initialized with `@base-ui/react` primitives and Tailwind CSS v4
  - Components installed: `Button`, `Input`, `Card`, `Dialog`, `Select`, `Badge`, `Textarea`, `Table`, `Skeleton`, `DropdownMenu`
  - Fully integrated with Nile Nexus design tokens and dark mode
- **Potential Clients & Research Pool Module**:
  - Zod validation schemas (`src/lib/schemas/potential-client.ts`) with opportunity indicators and phone normalization
  - Server Actions (`src/lib/actions/potential-clients.ts`):
    - `getPotentialClients`: paginated list with search, status filtering, and relations
    - `getPotentialClientById`: full client profile with opportunity indicators and research owner
    - `createPotentialClient`: duplicate check, concurrency-safe business ID (`generate_business_id`), activity logging
    - `updatePotentialClient`: field updates and opportunities synchronization
    - `updatePotentialClientStatus`: status workflow (`NEW` -> `RESEARCHING` -> `RESEARCHED` -> `CONVERTED` -> `ARCHIVED`)
    - `checkDuplicatePotentialClient`: duplicate detection across potential clients and confirmed clients
  - UI Components (`src/components/potential-clients/`):
    - `PotentialClientStatusBadge`: color-coded badges for all research lifecycle stages
    - `OpportunityBadges`: visual chips for identified client needs
    - `CreatePotentialClientDialog`: modal with real-time duplicate warning and opportunity selector
    - `PotentialClientsFilter`: search bar with debouncing and status filter buttons
    - `PotentialClientsTable`: responsive table view for desktop and card layout for mobile
    - `PotentialClientDetail`: research console with editable notes, opportunity toggles, status workflow buttons, and conversion modal
    - `PotentialClientsClient`: interactive client container
  - Pages:
    - `/potential-clients`: search and directory view
    - `/potential-clients/[id]`: detailed research console
  - Translations:
    - Expanded `messages/ar.json` and `messages/en.json` with field names, opportunity indicators, and Egyptian colloquial microcopy
  - Vitest Unit Tests:
    - `src/lib/schemas/__tests__/potential-client.test.ts` (9 tests)
    - `src/lib/actions/__tests__/potential-clients.test.ts` (5 tests)
    - Total test suite now at 23 passing tests

## [0.1.0] - 2026-10-03

### Added
- Next.js 16 App Router project with TypeScript strict mode
- Tailwind CSS v4, ESLint, Prettier configuration
- Arabic/English i18n with next-intl (Arabic default, Egyptian colloquial)
- RTL/LTR runtime language switching
- Dark mode support via next-themes
- Supabase client architecture (browser, server, admin, middleware)
- Auth middleware with route protection and session refresh
- Login page with form validation and i18n
- Auth callback route for email confirmation/password reset
- App shell: sidebar navigation (desktop), bottom navigation (mobile), header
- Language switcher component
- Global search bar (UI shell)
- Domain type definitions for all core business entities
- Environment validation with Zod
- Database migrations: initial schema, RLS policies, seed data
- 30+ tables including profiles, clients, deals, proposals, follow-ups, etc.
- Comprehensive RLS policies for GM/ADMIN/SALES role separation
- Seed data: pipeline stages, services, lead sources, permissions, settings
- Concurrency-safe business ID generation function
- Phone normalization triggers
- Auto-profile creation on auth.users insert
- Vitest test setup with 9 passing tests
- `.env.example` with safe placeholder values

### Documentation
- AGENTS.md and .agents/AGENTS.md (agent instructions)
- README.md with setup guide and project structure
- PROJECT_STATE.md, NEXT_TASK.md, CHANGELOG.md
- docs/: ARCHITECTURE.md, DATABASE.md, DECISIONS.md, DEPLOYMENT.md, PRODUCT_SPEC.md, RLS_SECURITY.md, TESTING.md
