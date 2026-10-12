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
- [x] Migration `010_enable_realtime_notifications.sql` generated
- [x] 100% Vitest tests passing (68/68) across 15 test suites and 0 TypeScript compilation errors
- [ ] Run migrations 009 & 010 in Supabase SQL Editor
- [ ] Onboard company sales representatives
