# Next Task

## Goal
Execute Production Database Clean-up & Roll Out to Company Employees:
1. Run `supabase/migrations/008_prepare_production_and_clean_demo_data.sql` in Supabase SQL Editor to wipe placeholder test data and reset business ID counters to `00001`.
2. Confirm GM login for Mohamed Hamed (`hamedelagamy00@gmail.com`) and Reem Ezz (`ezzreem726@gmail.com`).
3. Invite or allow sales team members to register through `https://nile-nexus-sales.vercel.app/login` (locked automatically to `SALES` role).

## Live Production URLs
- **Production URL**: [https://nile-nexus-sales.vercel.app](https://nile-nexus-sales.vercel.app)
- **Supabase SQL Editor**: [https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new](https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new)
- **Vercel Project Dashboard**: [https://vercel.com/hamed-elagamy/nile-nexus-sales](https://vercel.com/hamed-elagamy/nile-nexus-sales)

## Verification Checklist
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
- [x] Branded global error boundary fallback in `src/app/error.tsx`
- [x] 100% Vitest tests passing (97/97) across 18 test suites and 0 TypeScript compilation errors across all 183 files
- [x] Next.js 16 production build verified cleanly across all 26 routes
- [ ] Push commit to origin main for automated Vercel Production deployment
- [ ] Onboard company sales representatives and verify live digital proposal links
