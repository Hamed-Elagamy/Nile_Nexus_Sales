# Next Task

## Goal
Release and merge stabilized repair branch `fix/tammlo-full-system-stabilization` into `main` after authorized review:
1. Review pull request / branch `fix/tammlo-full-system-stabilization` against `main`.
2. Apply migration `supabase/migrations/015_harden_profile_role_security.sql` in Supabase SQL Editor if database-level role lock is desired.
3. Deploy to Vercel production and confirm active sales operations.

## Live Production URLs
- **Production URL**: [https://nile-nexus-sales.vercel.app](https://nile-nexus-sales.vercel.app)
- **Supabase SQL Editor**: [https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new](https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new)
- **Vercel Project Dashboard**: [https://vercel.com/hamed-elagamy/nile-nexus-sales](https://vercel.com/hamed-elagamy/nile-nexus-sales)

## Verification Checklist
- [x] Full-system stabilization & root-cause repairs completed on `fix/tammlo-full-system-stabilization`
- [x] Zero regressions: 147/147 Vitest tests passing across 26 test suites (100% pass rate)
- [x] Zero TypeScript compiler errors across 217 source files (`npm run typecheck`)
- [x] Zero ESLint errors across entire project (`npm run lint` exited 0)
- [x] 100% production build success across all 30 routes (`npm run build`)
- [x] Privilege escalation vulnerability in `src/lib/actions/team.ts` patched and tested with 8 new security unit tests
- [x] Database security migration `015_harden_profile_role_security.sql` created
- [x] Complete E2E business workflows test suite created and verified (`src/lib/__tests__/e2e-employee-workflows.test.ts`)
- [x] RFC 4122 v4 UUID normalization applied across all fallback actions, eliminating downstream Zod validation aborts
- [x] Live Real-Time Device Notifications & Automated Multi-Device Dispatch System deployed
- [x] Executive 3-tone acoustic chime with autoplay unlock and mobile haptic vibration
- [x] PWA App Badging (`navigator.setAppBadge`) on home screen and dock icons
- [x] Proactive device notification activation prompt banner (`DeviceNotificationPrompt`)
- [x] Automated notifications wired into Nexa leads, Coffex leads, deals (won & created), follow-ups, and tasks
- [x] 100% test pass rate across 24 test suites (134/134 tests passing) with 0 TypeScript errors across 215 files
- [x] Full operational overhaul of Executive Tasks (`/tasks`) with creation, editing, details, and status toggling
- [x] Dual-resilience Server Actions for Tasks (`src/lib/actions/tasks.ts`) supporting Supabase & Demo mode
- [x] 14 new unit tests for Tasks; 133/133 tests passing with 0 TypeScript errors across 214 files
- [x] Dedicated Nexa E-Commerce & Retail Sales Lead Capture module deployed (`/nexa`)
- [x] Nexa mobile-first onsite capture form with GPS, draft persistence, and Egyptian carrier detection
- [x] Nexa leads directory with live search, vertical & interest filters, and UTF-8 BOM CSV export
- [x] Dual-resilience server actions with automatic fallback to `potential_clients` tagged `[NEXA_LEAD]`
- [x] Full bilingual localization (Arabic RTL default, English LTR) in `messages/ar.json` & `messages/en.json`
- [x] Global navigation integration (desktop sidebar, mobile drawer, floating speed dial, command palette)
- [x] Migration `013_create_nexa_leads.sql` authored with RLS policies and sequential ID generator (`NXA-00001`)
- [x] 100% test coverage passing (119/119 unit tests passing across 22 test files)
- [x] Application rebranded to Tammlo Sales (Brand Name, Logo & Icon suite)
- [x] Application successfully built and optimized with Next.js Turbopack
- [x] All 24 routes operational with zero 404s (including `/manifest.webmanifest`)
- [x] UI decoupled from demo-data (0 `.tsx` files importing mock data)
- [x] Full 14-tab mobile navigation drawer and "More / المزيد" bottom bar trigger operational
- [x] Services catalog editing & deletion and Lead sources deletion enabled for Admin & GM roles
- [x] Egyptian Arabic Sales Representative Manual generated (PDF & Markdown)
- [x] Clean translated empty states implemented for tasks, calendar, approvals, reports, notifications
- [x] Migration `008_prepare_production_and_clean_demo_data.sql` generated and verified
- [x] Migration `009_seed_173_services_catalog.sql` generated with all 173 Nile Nexus software services & rates
- [x] Services Catalog UI enhanced with live instant search, status filtering, multi-field sorting, and pagination
- [x] Proposal Service Picker integrated into `/proposals/new` with 1-click line item populator
- [x] 1-Click WhatsApp Smart Business Templates dialog with 5 tailored Egyptian sales messages
- [x] 1-Click Deal creation button directly inside Services Catalog rows
- [x] Sales Target & Commission Tracker with interactive simulation on `/dashboard` and `/reports`
- [x] 1-Click Excel / CSV Export with UTF-8 BOM across Clients, Deals, Services, and Reports
- [x] PWA standalone mobile app configuration (`manifest.ts`, `manifest.json`, Service Worker `sw.js`, and icons suite)
- [x] Multi-platform PWA support: Dedicated interactive installation tabs for Windows (PC), Android, and iOS
- [x] Middleware public whitelisting for `/sw.js`, `/manifest.webmanifest`, `/manifest.json`, and `/icons` to prevent 307 login redirection
- [x] Immediate Service Worker cache busting (`nile-nexus-v2`) with automated eviction of stale caches
- [x] Quick-access "تثبيت التطبيق (كمبيوتر وموبايل)" action in `AppHeader` across all screen sizes
- [x] Cross-device Real-Time notifications (Supabase Realtime, synthesized Web Audio chime, vibration, and OS push)
- [x] Dynamic header NotificationBell with live unread counter and popover preview
- [x] Interactive `/notifications` center with device push activation toggle and test chime trigger
- [x] Full bilingual notifications system (English and Egyptian Arabic) with runtime localization and numeral/time normalization
- [x] Clear All notifications button with confirmation modal and individual notification delete actions
- [x] Potential clients role-restricted deletion (GM & Admin only) with confirmation dialogs
- [x] Potential clients editing modal and missing data quick triggers for Sales representatives
- [x] Luxury Style & Visual UX Engine (5 palettes, celebratory canvas confetti, Web Audio synth sounds, ambient aura glow, rolling animated numbers, live milestone ticker)
- [x] In-Use Daily Productivity Utilities (Command Palette Ctrl+K, VAT 14% & installments calculator, persistent scratchpad, corporate snippets, speed dial, carrier badges)
- [x] Software Sales Execution Suite (Project Scope & Tech Stack Estimator /estimator, Software ROI & Payback calculator, Objection Buster Battlecards Hub, Bulk CSV leads importer)
- [x] Multi-Tier Proposal Package Matrix (`MultiTierPackageMatrix`) with 3 tiers (MVP, Recommended, Enterprise) & SLA comparisons
- [x] Public Client Digital Proposal & E-Signature Portal (`/quote/[id]` & `ClientDigitalProposal`) with HTML5 canvas signature pad & 1-click legal approval
- [x] Deal Activity Heat & Stalled Deal Alert System (`DealHeatBadge` 🔥 / ⚡ / ❄️) on Pipeline cards and Deals tables
- [x] 4-Step WhatsApp Drip Sequences Hub (`WhatsAppSequencesDialog`) with 5 tailored Egyptian sales templates
- [x] Sales Quota & Gamified Commission Simulator (`/targets` & `CommissionQuotaSimulator`) with Bronze, Silver, Gold, and Diamond tiers
- [x] Structured Deal Loss Post-Mortem Analytics (`LostDealDialog`) with reason pills, competitor tracking, budget capture, and resurface presets
- [x] Client Health & Relationship Risk Score (`ClientHealthBadge` & `evaluateClientHealth`) with dynamic 0-100 score
- [x] Deal Stage Playbook & Objection Helper Popover (`DealStagePlaybook`) with BANT questions, action steps, and pro-tips
- [x] Crash-Proof Theme Accent Picker: zero-dependency popover with click-outside listener, fixing mobile crash
- [x] Mobile Floating Speed Dial lifted to `bottom-20 md:bottom-6` to eliminate overlap with bottom bar "More / المزيد"
- [x] Bilingual Speed Dial actions with 100% synchronized `speedDial` dictionary namespace
- [x] Header Search button layout fixed with guaranteed width & hidden Ctrl+K on mobile to eliminate overlap
- [x] Live Activity Ticker upgraded to responsive `hidden xl:flex` with bilingual `Live:` and English translations
- [x] Targets & Quotas module completely localized into clean Arabic & English without parenthetical labels
- [x] Project Estimator & Dialog completely localized into clean Arabic & English with optimized dialog height
- [x] Multi-Tier Proposal Matrix made bilingual with automatic locale switching
- [x] Eradicated all demo simulation data and placeholder records across UI and fallback state
- [x] Connected `/targets` to live Supabase active profiles and won deals
- [x] Mapped 6 real enterprise team members (Mohamed Hamed, Reem Ezz, Nesma Fathy, Omar El Bagoury, Riham ELSayed, Zeinab Ahmed)
- [x] Phase 24: Dedicated Coffex Onsite Sales Field System (`/coffex`) with 1-Click GPS, Egyptian carrier detection, coffee-specific fields, celebratory feedback, WhatsApp instant outreach, and leads directory
- [x] Strict preservation of existing localization architecture: zero hardcoded text, standard Arabic/English style, draft persistence across language switching
- [x] Database migration `supabase/migrations/012_create_coffex_leads.sql` authored with RLS, indexes, and sequential ID sequence (`CFX-00001`)
- [x] 100% Vitest tests passing (108/108 across 20 test suites) and 0 TypeScript compilation errors (193 files)
- [x] 100% bilingual dictionary synchronization (1,195 keys each in `messages/ar.json` and `messages/en.json`)
- [ ] Push latest commit to origin main for automated Vercel Production deployment
- [ ] Execute migration `012_create_coffex_leads.sql` in Supabase SQL Editor
