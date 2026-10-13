# Project State — Nile Nexus Sales

## Current Phase
Production Deployed — Live on Vercel & Connected to Supabase

## Completed Phases
- **Phase 0**: Repository & Documentation bootstrap
- **Phase 1**: Foundation & Design System (Next.js 16, Tailwind CSS v4, shadcn/ui components, i18n ar/en, dark mode, Supabase client suite, Auth middleware, login)
- **Phase 2**: Database Migrations (001_initial_schema, 002_rls_policies, 003_seed_data)
- **Phase 4 (CRM Core)**:
  - Part 1: Potential Clients & Research Pool Module (`/potential-clients`, `/potential-clients/[id]`)
  - Part 2: Clients & Contacts Management Module (`/clients`, `/clients/[id]`)
  - Part 3: Deals & Pipeline Kanban Module (`/deals`, `/deals/[id]`, `/pipeline`)
- **Phase 5 (Sales Execution)**:
  - Follow-ups Daily Workspace (`/follow-ups` Today, Overdue, Upcoming, Completed)
  - Quick action to complete follow-up and schedule next step in one transaction
  - Direct call and WhatsApp launcher
  - Activity logging on all follow-up events
- **Phase 6 (Commercial Proposals & Quotations)**:
  - Commercial Proposals directory and creation wizard (`/proposals`, `/proposals/new`)
  - Dynamic line items manager with real-time decimal financial calculations
  - Immutable versioning (v1, v2...) on acceptance/sending
  - Professional printable quotation view with window.print() and PDF export support
- **Phase 7 (Team & Settings Management)**:
  - Team directory with role assignment (GM, ADMIN, SALES) and account status controls (`/team`)
  - System settings managing services catalog and marketing lead sources (`/settings`)
- **Phase 8 (Executive Dashboard)**:
  - Live dashboard pulling real aggregated metrics from database: open pipeline value, won deals, active clients, potential clients pool, today's due follow-ups, and urgent overdue alerts (`/dashboard`)
- **Phase 9 (Complete Application Usability & Standalone Demo Mode)**:
  - Zero-configuration interactive Demo Mode enabled out of the box when Supabase environment variables are missing
  - 1-Click Quick Demo Login for all 3 company roles: General Manager (المدير العام), Administrator (المشرف), and Sales Representative (مسؤول المبيعات)
  - Completed all missing sidebar routes (eliminating all 404 errors):
    - `/tasks`: Sales task manager with priorities (عاجل، هام، عادي), status tracking, and deal linkage
    - `/calendar`: Commercial agenda with client demos, meetings, and deadlines
    - `/approvals`: GM & Admin approvals center for discount overrides (>5%) and payment terms exceptions
    - `/reports`: Sales conversion funnel analysis, revenue metrics in EGP, and rep leaderboard
    - `/notifications`: System alert center with unread counters and deep links
  - Preloaded comprehensive Egyptian commercial sales dataset
  - Header database connection indicator badge (Demo Mode vs Supabase Connected)
- **Phase 10 (Production Deployment & Vercel Integration)**:
  - Linked and configured Vercel production project: `nile-nexus-sales`
  - Configured live production environment variables on Vercel:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - Successfully built and deployed to Vercel Production
  - Live production URL: `https://nile-nexus-sales.vercel.app`
  - Verified live deployment responsiveness
- **Phase 11 (Application-wide Localization & Content Revision)**:
  - 100% dictionary synchronization between `messages/ar.json` and `messages/en.json` (787 keys each, zero missing)
  - Eradicated all hardcoded bilingual parenthetical labels and slash patterns (`العميل / Client`, `كتالوج الخدمات (Services)`)
  - Localized every single screen, dialog, filter, status badge, and print view across all modules
  - Full TypeScript type safety (`tsc --noEmit` 0 errors) and all 60 Vitest tests passing (100% pass rate)
- **Phase 12 (Production Database Preparation & Complete Demo Data Transition)**:
  - Authored Migration `008_prepare_production_and_clean_demo_data.sql` to purge all placeholder test records and reset business ID counters to 00001
  - Fully decoupled UI from demo data: `tasks`, `calendar`, `approvals`, `reports`, and `notifications` now query Supabase directly
  - 0 `.tsx` files in the repository import or depend on demo data
  - Full production readiness for internal company employee rollout
- **Phase 13 (Full 14-Tab Mobile Navigation & Slide-Over Drawer UX)**:
  - Developed full slide-over mobile navigation drawer exposing all 14 tabs on smartphones
  - Integrated mobile top header hamburger button (☰) and bottom navigation "More / المزيد" tab
  - Added user profile summary card, role badge, language switcher, and logout trigger to drawer
  - Added mobile body scroll lock, ESC key listener, and `pb-24` main content bottom padding
  - Zero TypeScript errors (`tsc --noEmit`) and 60/60 tests passing (100% pass rate)
- **Phase 14 (Services Catalog & Lead Sources Management for Admin & GM)**:
  - Added Edit and Delete dialogs for Services Catalog with reference price and currency editing
  - Added Edit and Delete dialogs for Marketing Lead Sources
  - Implemented safe deletion with automatic archiving (`is_active = false`) for items in active use
  - Enforced multi-layer role protection (GM and Admin only) in UI and server actions
  - Converted Settings page metadata to dynamic locale-aware metadata
  - Zero TypeScript errors (`tsc --noEmit`) and 60/60 tests passing (100% pass rate)
- **Phase 15 (Sales Representative Training & Operations Manual - Egyptian Arabic)**:
  - Authored official 7-page Sales Representative training manual in Egyptian Arabic
  - Generated professional vector PDF with Cairo typography: `docs/Nile_Nexus_Sales_Manual_Guide_AR.pdf`
  - Created in-repo markdown guide: `docs/SALES_REP_MANUAL_AR.md`
  - Automated PDF build pipeline: `scripts/generate-sales-manual-pdf.mjs`
- **Phase 16 (Full 173 Software Services Catalog Integration & Advanced UI)**:
  - Extracted, normalized, and integrated all 173 software project types from the official Nile Nexus Pricing document (`Base MVP / Starter Rates` from 4,000 EGP to 150,000 EGP)
  - Generated database migration `supabase/migrations/009_seed_173_services_catalog.sql` containing all 173 services with exact sort orders (`1` to `173`), Arabic names, English names, and EGP prices
  - Synchronized offline/demo fallback catalog `demoServices` in `src/lib/demo-data.ts`
  - Upgraded Services Catalog component (`src/components/settings/services-catalog.tsx`) with live instant search, status filtering, multi-field sorting, configurable pagination (25/50/100/All), and catalog summary badges
  - Created dedicated `/services` route (`src/app/(authenticated)/services/page.tsx`) and added it to primary navigation in desktop sidebar and mobile drawer
  - Configured Sales Representative permissions: read-only access with clear availability indicators (`متاحة للتعاقد` vs `غير متاحة`) and starter prices, while editing, adding, and deleting controls are strictly restricted to GM and Admin
  - Added comprehensive i18n keys to both `messages/ar.json` and `messages/en.json`
  - Verified 0 TypeScript errors and 100% Vitest tests passing (60/60)
- **Phase 17 (5 High-Impact Commercial Enhancement Features for Sales Operations)**:
  - **Feature 1 (Proposal Service Picker)**: Embedded 173 Services Catalog modal picker inside `/proposals/new` with instant search and 1-click line item populator.
  - **Feature 2 (1-Click WhatsApp Smart Templates)**: Built Egyptian Arabic sales templates modal (`whatsapp-quick-dialog.tsx`) with 5 tailored messages across follow-ups, clients, and leads.
  - **Feature 3 (1-Click Deal from Services Catalog)**: Added `+ صفقة` direct action on active services in `/services` pre-filling title and estimated value.
  - **Feature 4 (Sales Target & Commission Tracker)**: Visual monthly progress bar with preset pills and 4-tier commission simulator on `/dashboard` and `/reports`.
  - **Feature 5 (1-Click Excel / CSV Export with UTF-8 BOM)**: Instant data export for Clients, Deals, Services, and Reports with UTF-8 BOM for crystal-clear Arabic Excel rendering.
  - **Quality Assurance**: Added CSV export unit tests (`export-csv.test.ts`), verified 14/14 test suites and 62/62 tests passing, 0 TypeScript errors, Next.js build clean.
- **Phase 18 (PWA Mobile Application & Cross-Device Real-Time Notifications)**:
  - **Progressive Web App (PWA)**: Implemented `src/app/manifest.ts` and `public/manifest.json` with standalone mobile display, theme color `#2563EB`, background `#0B132B`, and full set of crisp Nile Nexus icons (192x192, 512x512, maskable, and apple-touch-icon in `public/icons/`).
  - **Service Worker (`public/sw.js`)**: Offline asset caching, push event handler, deep-link click focus, and global `ServiceWorkerRegister`.
  - **In-App Install Prompt (`pwa-install-prompt.tsx`)**: Android 1-click installation banner and iOS Safari 3-step visual guide sheet with drawer and settings integration.
  - **Cross-Device Real-Time Notifications**: Global `RealtimeNotificationProvider` with Supabase Realtime channel subscription, Web Audio synthesized chime, haptic vibration, and OS push notifications.
  - **Interactive Notification Bell & Feed**: Dynamic header bell (`NotificationBell`) with live unread badge, popover feed preview, and `/notifications` interactive center with filter tabs.
  - **Settings Integration**: Dedicated Device & Notifications management card in `/settings`.
  - **Database & Testing**: Migration `010_enable_realtime_notifications.sql`, 15/15 Vitest suites passing (68/68 tests), Next.js build verified (24/24 routes).
- **Phase 19 (PWA Multi-Platform Support & Middleware Public Whitelisting Fix)**:
  - **Root Cause Resolution**: Solved middleware HTTP 307 login redirection of `/sw.js` and `/manifest.webmanifest` by updating the matcher regex in `src/middleware.ts` and whitelisting all PWA assets (`/sw.js`, `/manifest.webmanifest`, `/manifest.json`, `/icons`) in `src/lib/supabase/middleware.ts`.
  - **Multi-Platform Installation Modal**: Enhanced `pwa-install-prompt.tsx` with dedicated interactive tabs for Windows PC, Android, and iOS, with automatic OS detection and 1-click native install support.
  - **Desktop Quick Access**: Added persistent "تثبيت التطبيق (كمبيوتر وموبايل)" action in `AppHeader` for immediate access on desktop and laptops.
  - **Manifest & Cache Optimization**: Updated manifest orientation to `any` for responsive desktop support; bumped Service Worker cache to `nile-nexus-v2` with automated purge of stale caches.
- **Phase 20 (Full Bilingual Notifications System - English & Egyptian Arabic)**:
  - **Bilingual Engine**: Created `src/lib/utils/localized-notification.ts` translating notifications dynamically to the active user language (English or Egyptian Arabic).
  - **Numeral & Time Normalization**: Converted Arabic-Indic numerals `(١٢:٤١:١٤ م)` to Western numerals `(12:41:14 PM)` and vice-versa.
  - **Server & Client Synchronization**: `sendTestNotification(locale)` supports active locale or cookie detection. `NotificationsClient`, `NotificationBell`, and `RealtimeNotificationProvider` render localized titles, bodies, and toast actions (`View` / `عرض`).
  - **Automated Testing**: 16/16 test files passing with 76/76 unit tests passing (100% pass rate). Next.js production build clean (24/24 routes).
- **Phase 21 (Notification Center Clear & Individual Delete Actions)**:
  - **Clear All with Confirmation Dialog**: Built "Clear All / مسح الكل" button in `/notifications` header with a confirmation modal preventing accidental data loss.
  - **Individual Notification Delete**: Added single delete buttons (`Trash2`) on every notification card in `/notifications` and quick clear action in `NotificationBell` header popover.
  - **Full Backend & RLS Support**: Server actions `clearAllNotifications()` and `deleteNotification(id: string)` with Supabase RLS deletes, cache revalidation, and optimistic state updates.
  - **Bilingual Translations**: 100% Arabic and English dictionary synchronization for all dialogs, buttons, and notifications toasts.
  - **Verification**: 16/16 Vitest test suites passing (78/78 tests), 0 TypeScript errors, Next.js production build clean.
- **Phase 22 (Potential Clients Role-Restricted Deletion & Missing Data Editing)**:
  - **Role-Restricted Deletion**: Restricted deleting potential clients to General Manager (`GM`) and System Administrator (`ADMIN`) only, with server-side authorization enforcement and frontend omission for Sales reps.
  - **Editing Submitted Potential Clients**: Built `EditPotentialClientDialog` enabling Sales representatives and Admins to edit any submitted potential client and fill missing data (phone, location, website, social handles, opportunities, notes).
  - **Missing Data Indicators**: Added intuitive inline triggers to prompt filling in unrecorded phone numbers, locations, and social/website links directly on the detail page.
  - **Database & Testing**: Migration `011_allow_gm_admin_delete_potential_clients.sql`, 16/16 Vitest test suites passing (82/82 tests), zero TypeScript compilation errors, Next.js production build verified (24/24 routes).

## Completed Work
- **Design System & UI Components**:
  - Initialized shadcn/ui with `@base-ui/react` primitives and Tailwind CSS v4
  - Installed and configured components: `Button`, `Input`, `Card`, `Dialog`, `Select`, `Badge`, `Textarea`, `Table`, `Skeleton`, `DropdownMenu`
- **Potential Clients Module**:
  - Zod schemas, server actions, UI components, tests, and pages (`/potential-clients`, `/potential-clients/[id]`)
- **Clients & Contacts Module**:
  - Schemas supporting `COMPANY` and `INDIVIDUAL` types
  - Concurrency-safe business IDs (`CLIENT-XXXXX`)
  - Server actions: `getClients`, `getClientById`, `createClient`, `updateClient`, `addContact`, `updateContact`, `convertPotentialClientToClient`
  - UI components and pages: `/clients`, `/clients/[id]`
- **Deals & Pipeline Kanban Module**:
  - Schemas for deals, stages, filters, lost deals
  - Server actions: `getDeals`, `getPipelineDeals`, `getDealById`, `createDeal`, `updateDeal`, `updateDealStage`
  - Pipeline Kanban board with horizontal scrolling and stage advance controls
  - UI components and pages: `/deals`, `/deals/[id]`, `/pipeline`
- **Follow-ups & Sales Execution Module**:
  - Schemas for follow-up actions, completion results, next steps, rescheduling
  - Server actions: `getFollowUps`, `createFollowUp`, `completeFollowUp`, `rescheduleFollowUp`
  - UI components and page: `/follow-ups`, badges, quick complete modal, reschedule modal, tab filters
- **Commercial Proposals & Quotations Module**:
  - Schemas for proposals, line items, version cloning, and status transitions
  - Concurrency-safe business IDs (`PROP-XXXXX`)
  - Server actions: `getProposals`, `getProposalById`, `createProposal`, `createProposalVersion`, `updateProposalVersionStatus`
  - UI components and pages: `/proposals`, `/proposals/new`, `/proposals/[id]`, `ProposalBuilder`, `ProposalPrintView`, `ProposalDetail`
- **Team, Settings & Dashboard Modules**:
  - Team management with role badges and active toggling (`/team`)
  - Direct photo upload from user device with smart client-side center-crop and compression (`/settings`)
  - Real-time profile photo and name synchronization across navigation header (`AppHeader`)
  - Services catalog and lead sources management (`/settings`)
  - Live executive dashboard with real KPI metrics and urgent overdue recovery (`/dashboard`)
- **All Auxiliary Routes & Pure Localization**:
  - Fully translated and localized with dynamic `next-intl` keys: `/tasks`, `/calendar`, `/approvals`, `/reports`, `/notifications`, `/team`, and `/settings`
  - Zero hardcoded Arabic strings when English is selected; zero awkward bilingual parentheses
- **Production Infrastructure**:
  - Live Vercel Production Deployment: `https://nile-nexus-sales.vercel.app`
  - Connected to Supabase Project: `https://zbbivheqcutwflewmtnb.supabase.co`
- **Tests**:
  - 68 Vitest unit tests passing across 15 test suites (100% pass rate)

## Database State
- 10 migrations written + unified deploy script:
  - `001_initial_schema.sql` — all core tables, indexes, triggers, functions
  - `002_rls_policies.sql` — comprehensive RLS for all tables
  - `003_seed_data.sql` — pipeline stages, services, permissions, settings
  - `004_create_initial_admin_users.sql` — initial administrative seed accounts
  - `005_fix_user_cascade_delete.sql` — user cascade deletion
  - `006_create_gm_reem_ezz_and_secure_signup.sql` — GM creation and lock public signups to SALES
  - `007_fix_profiles_rls_and_insert_policy.sql` — profiles INSERT/DELETE RLS policies and user backfill
  - `008_prepare_production_and_clean_demo_data.sql` — cleans test data and resets ID sequences
  - `009_seed_173_services_catalog.sql` — cleans out legacy non-PDF services, enforces uniqueness, and seeds strictly the 173 Nile Nexus services
  - `010_enable_realtime_notifications.sql` — enables Supabase Realtime publication on notifications with REPLICA IDENTITY FULL and bi-directional column syncing
  - `all_in_one_deploy.sql` — consolidated single-run deployment migration

## Security State
- RLS policies designed for all tables
- Auth middleware protects all `/` routes except `/login` and `/auth/*`
- Supabase client separation (browser, server, admin)
- Server actions enforce user authentication and ownership boundaries
- Dual-mode architecture maintains strict separation between demo mock sessions and live Supabase queries

## Test Status
- ✅ Vitest: 68/68 passing across 15 suites
- 0 failed

## Build Status
- ✅ TypeScript: 0 errors (`tsc --noEmit`)
- ✅ ESLint: 0 errors, 0 warnings (`eslint`)
- ✅ Production build: compiled and optimized successfully for all 24 routes (`next build`)
- ✅ Vercel Production Deployment: READY at `https://nile-nexus-sales.vercel.app`

## Known Bugs
- None

## Environment Requirements
- `NEXT_PUBLIC_SUPABASE_URL` (configured on Vercel)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (configured on Vercel)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (configured on Vercel)
- `SUPABASE_SERVICE_ROLE_KEY` (optional)

## Latest Pushed Commit
- `0a1339e` (fix(auth): prevent cookie overflow 494 REQUEST_HEADER_TOO_LARGE and add Supabase Storage avatar support)

## Next Actions
- Verify live production user workflows on `https://nile-nexus-sales.vercel.app`
