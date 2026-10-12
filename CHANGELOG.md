# Changelog

All notable changes to this project will be documented in this file.

## [1.5.2] - 2026-10-12

### Fixed & Enhanced
- **Full Bilingual Notifications System (English & Egyptian Arabic)**:
  - **Dynamic Runtime Notification Localization**:
    - Created `src/lib/utils/localized-notification.ts` with `formatLocalizedNotification` engine capable of translating notifications dynamically based on active locale (`ar` or `en`).
    - Localizes test notifications, urgent follow-up alerts, accepted proposals, approved deals, and new leads seamlessly into English or Arabic.
    - Added Arabic-to-English numeral and timestamp conversion (`(١٢:٤١:١٤ م)` -> `(12:41:14 PM)`).
  - **Bilingual Server Action**:
    - Updated `sendTestNotification(targetLocale?: "ar" | "en")` in `src/lib/actions/notifications.ts` to generate English text when the user's active locale is `en`, and Arabic when `ar`.
    - Integrated with `getUserLocale()` cookie inspection for automatic server-side language detection.
  - **Component Synchronization**:
    - Updated `NotificationsClient` (`/notifications`), `NotificationBell` header popover, and `RealtimeNotificationProvider` to display all notification titles, bodies, toast actions, and timestamps in the active user language.
    - Updated `public/sw.js` push notification actions and fallback strings to bilingual format (`عرض | View`, `إغلاق | Close`).
  - **Automated Testing**:
    - Added unit test suite `src/lib/utils/__tests__/localized-notification.test.ts` (7 tests).
    - Updated `src/lib/actions/__tests__/notifications.test.ts` with bilingual test notification assertions. Total test count reached 76/76 passing (100%).

## [1.5.1] - 2026-10-12

### Fixed & Enhanced
- **PWA Multiplatform Installation & Middleware Public Access**:
  - **Middleware Bypass for Service Worker & Manifests**:
    - Excluded `/sw.js`, `/manifest.webmanifest`, `/manifest.json`, and `/icons/*` from Next.js authentication middleware matcher in `src/middleware.ts`.
    - Added `/sw.js`, `/manifest.webmanifest`, `/manifest.json`, and `/icons` to `publicPaths` in `src/lib/supabase/middleware.ts` to prevent HTTP 307 temporary redirects to `/login` when browsers or Service Workers fetch manifests and service workers.
  - **Multi-Platform Installation Experience**:
    - Added comprehensive interactive tabs for **Windows (PC)**, **Android**, and **iPhone/iOS** in `pwa-install-prompt.tsx` with device auto-detection and 1-click install action.
    - Updated manifest `orientation` from `portrait-primary` to `any` to support desktop displays, widescreen laptops, and tablets.
    - Added persistent "تثبيت التطبيق (كمبيوتر وموبايل)" quick-access button directly in `AppHeader` across all devices.
  - **Cache Invalidation & Auto-Update**:
    - Bumped Service Worker cache version to `nile-nexus-v2` in `public/sw.js` and added automated purge of legacy caches on activation.
    - Added `registration.update()` in `ServiceWorkerRegister` on window load to force immediate worker refresh.

## [1.5.0] - 2026-10-12

### Added & Enhanced
- **PWA Mobile Application & Full Standalone Smartphone Experience**:
  - **Progressive Web App (PWA) Foundation**:
    - Created Next.js native `src/app/manifest.ts` and static `public/manifest.json` configured for standalone mobile display mode, portrait orientation, theme color `#2563EB`, and splash background `#0B132B`.
    - Generated full suite of high-resolution Nile Nexus branded application icons in `public/icons/`:
      - Standard 192x192 and 512x512 PNG icons
      - Adaptive maskable 192x192 and 512x512 PNG icons
      - Apple Touch Icon (180x180) for iPhone/iPad home screens
      - Scalable vector icon (`public/icons/icon.svg` & `public/favicon.svg`)
    - Configured Apple mobile web app tags (`appleWebApp.capable: true`, `statusBarStyle: "default"`, `viewportFit: "cover"`, touch-callout prevention, and safe-area insets).
  - **Service Worker (`public/sw.js`) & Client Caching**:
    - Installed active Service Worker caching application shell and static assets for instant offline mobile startup.
    - Full push event handling displaying system notifications with title, body, icon, badge, and vibration.
    - Notification click event listener deep-linking directly to target screens (`/notifications`, `/deals`, `/follow-ups`).
    - Client registration component `ServiceWorkerRegister` mounted globally.
  - **Native Installation Prompt & iOS Guided Sheet (`pwa-install-prompt.tsx`)**:
    - Android / Chromium: Automatically intercepts `beforeinstallprompt` to offer 1-tap native installation banner.
    - iOS Safari: Sleek 3-step visual instruction sheet explaining Share (⎋) -> Add to Home Screen (⊞) -> Add (إضافة).
    - Added dedicated "تثبيت التطبيق على الهاتف" triggers in the mobile slide-over navigation drawer and settings page.
- **Cross-Device Real-Time Notifications Engine**:
  - **Supabase Realtime Channel Integration**:
    - Global `RealtimeNotificationProvider` subscribing to Postgres `INSERT` and `UPDATE` changes on `notifications` table for the authenticated user.
    - Background polling fallback (45s interval) ensuring 100% notification delivery during mobile device sleep/wake cycles.
  - **Audio & Haptic Feedback**:
    - Synthesized dual-tone audio chime (587 Hz D5 -> 880 Hz A5) using Web Audio API — 100% offline, zero network latency, zero external audio asset dependencies.
    - Device vibration patterns (`navigator.vibrate([150, 70, 150])`) on smartphones.
  - **OS System Notifications**:
    - Dispatches native system notifications to lock screen and notification shade via Web Notifications API and Service Worker.
  - **Interactive Notification Bell (`src/components/layout/notification-bell.tsx`)**:
    - Replaced static header link with dynamic bell showing live unread badge, pulse/ping animations on new alerts, and connection status indicator.
    - Interactive dropdown popover with quick mark all as read, permission toggle, recent alerts feed, and instant test chime trigger.
  - **Dedicated Notifications Center (`/notifications`)**:
    - Interactive client interface with real-time status card (Realtime connected 🟢 / Device Push active ✅).
    - Filter tabs: All, Unread Only, Action Required (🚨), and System Updates.
    - Individual mark-as-read and deep action links.
  - **Settings Integration & Database Migration**:
    - Added "إعدادات الموبايل والإشعارات الفورية" card in `/settings`.
    - Authored migration `010_enable_realtime_notifications.sql` adding `notifications` to `supabase_realtime` publication with REPLICA IDENTITY FULL and column aliases.
- **Comprehensive Verification & Testing**:
  - Added unit test suite `src/lib/actions/__tests__/notifications.test.ts` (6 tests passing).
  - 15/15 test suites passing with 68/68 tests (100% pass rate).
  - TypeScript strict mode 0 errors (`tsc --noEmit`).
  - Next.js production build verified (`next build` 24/24 routes optimized, including `/manifest.webmanifest`).

### Added & Enhanced
- **5 High-Impact Commercial Enhancement Features for Sales Operations**:
  - **1. Proposal Service Picker (`/proposals/new`)**:
    - Integrated the 173 Services Catalog directly into the commercial proposal builder.
    - Added a `+ إضافة من كتالوج الخدمات` action button and responsive modal picker in `ProposalBuilder`.
    - Real-time search by service name or code with live pricing preview.
    - 1-click line item insertion or replacement automatically populating service name, description, unit price in EGP, and calculating line totals and taxes.
  - **2. 1-Click WhatsApp Smart Templates (`src/components/shared/whatsapp-quick-dialog.tsx`)**:
    - Professional Egyptian Arabic business communication templates tailored for sales reps:
      - *تعريف بالشركة واستكشاف الاحتياج* (Initial introduction & discovery)
      - *متابعة عرض السعر / الاقتراح التجاري* (Proposal & quote follow-up)
      - *تأكيد موعد العرض التوضيحي أو الاجتماع* (Demo / meeting confirmation)
      - *تذكير لطيف بالمتابعة السابقة* (Gentle touchpoint reminder)
      - *ترحيب وتأكيد التعاقد الناجح* (Deal won & welcome onboarding)
    - Auto-injects recipient contact name, salesperson signature, and message length counter.
    - Includes interactive editable textarea, copy-to-clipboard, and instant WhatsApp Web / App launcher (`https://wa.me/20...`).
    - Unified across `follow-up-card.tsx`, `client-detail.tsx`, `clients-table.tsx`, `contacts-list.tsx`, `potential-client-detail.tsx`, and `potential-clients-table.tsx`.
  - **3. 1-Click Deal Creation from Services Catalog (`/services`)**:
    - Added a `+ صفقة` direct action button on every active service card/row for all team members (Sales Representatives, Admin, and GM).
    - Opens the deal creation dialog pre-filled with the service title as deal name, the catalog reference rate as estimated value, and currency set to `EGP`.
    - Enables reps to transition from client discovery directly into pipeline creation in seconds.
  - **4. Sales Target & Commission Tracker (`/dashboard` & `/reports`)**:
    - Interactive monthly revenue progress card with customizable target and quick-select presets (150K, 250K, 500K, 1M EGP).
    - Dynamic gradient progress bar with achievement percentage, milestone badges, and motivating Egyptian Arabic coaching guidance.
    - Commission simulator calculating earned commission on closed won revenue and expected pipeline commission (50% projected conversion) across 3%, 5%, 7%, and 10% commission tiers.
    - Embedded seamlessly into both the Executive Dashboard and the Analytics Reports center.
  - **5. 1-Click Excel / CSV Export with UTF-8 BOM (`src/lib/utils/export-csv.ts`)**:
    - Client-side export utility prepending `\uFEFF` UTF-8 Byte Order Mark ensuring 100% flawless Arabic character rendering in Microsoft Excel (preventing mojibake/garbled text).
    - Integrated across Clients (`/clients`), Deals (`/deals`), Services Catalog (`/services`), and Reports (`/reports`).
- **Comprehensive Quality & Testing Verification**:
  - Full Vitest unit test coverage for the CSV export utility (`src/lib/__tests__/export-csv.test.ts`) validating UTF-8 BOM byte sequence (`0xEF, 0xBB, 0xBF`), row formatting, and quotes escaping.
  - 14/14 test suites passing with 62/62 tests (100% pass rate).
  - TypeScript strict mode verified (`tsc --noEmit` 0 errors).
  - Next.js production build verified (`next build` 23/23 routes compiled and statically optimized).
  - 100% translation key parity between `messages/ar.json` and `messages/en.json`.

### Added & Enhanced
- **Full 173 Software Projects Services Catalog & Advanced Filtering UI**:
  - **Comprehensive 173 Software Services Dataset**:
    - Extracted and normalized all 173 software project types from the official Nile Nexus pricing list (`Base MVP / Starter Rates`).
    - Spans mobile apps, web applications, multi-vendor marketplaces, micro-SaaS, enterprise ERP & CRM modules, AI agents, IoT dashboards, logistics, and fintech integrations.
    - Reference starter prices ranging from 4,000 EGP to 150,000 EGP with currency set to `EGP`.
    - Every service tagged with sequential `sort_order` (1 to 173), full Arabic title, and English counterpart.
  - **Production Database Migration (`009_seed_173_services_catalog.sql`)**:
    - Created idempotent PostgreSQL script with `ON CONFLICT (name_ar)` DO UPDATE upsert logic.
    - Safely replaces initial 8 placeholder services with all 173 official software products.
  - **Fallback / Offline Data Parity (`demoServices` in `src/lib/demo-data.ts`)**:
    - Fully updated with all 173 items, maintaining offline reliability and testing parity.
  - **Enhanced Services Catalog Management UI (`src/components/settings/services-catalog.tsx`)**:
    - **Live Instant Search**: Full-text bilingual query across Arabic name, English name, reference price, and service order number (`#`).
    - **Status Filter**: Fast toggle between All, Active Only, and Inactive Only.
    - **Multi-Field Sorting**: Order by Default (#), Price (High-to-Low), Price (Low-to-High), Arabic alphabetical (A-Z), and English alphabetical (A-Z).
    - **Smart Pagination**: Configurable per-page selector (25, 50, 100, or View All) with dynamic page jumping and counter indicators.
    - **Summary Badges**: Displays total registered services, active count, and real-time filtered results.
    - Preserved full GM & Admin inline editing, activation toggling, and soft-delete protection.
  - **Dedicated `/services` Route & Read-Only Access for Sales Representatives**:
    - Created dedicated `/services` page (`src/app/(authenticated)/services/page.tsx`) and added it to primary navigation in both desktop sidebar and mobile slide-over navigation drawer.
    - Sales representatives can now easily browse all 173 services, verify real-time availability (`متاحة للتعاقد` vs `غير متاحة حالياً`), and review starter prices in EGP during client discussions.
    - Strict role permission enforcement: `SALES` role receives a clean read-only directory view with an informative guide banner; all management controls (Add, Edit, Delete, Toggle active) are hidden and protected server-side.
    - GM and Admin roles retain full editing, adding, and archiving capabilities across both `/services` and `/settings`.
  - **Internationalization (i18n)**:
    - Added complete translation keys across `messages/ar.json` and `messages/en.json`.
  - **Quality & Verification**:
    - Passed Next.js production build (`next build`), 0 TypeScript errors (`tsc --noEmit`), and 60/60 passing Vitest unit tests.

## [1.2.0] - 2026-10-11

### Added & Enhanced
- **Services Catalog & Lead Sources Management for Admin and GM Roles**:
  - **Services Catalog Editing & Deletion**:
    - Added **Edit Service (تعديل الخدمة)** dialog allowing GM and Admin roles to update Arabic name, English name, reference price, and currency.
    - Added **Delete Service (حذف الخدمة)** dialog with confirmation. If a service is linked to existing deals or commercial proposals, it is safely soft-deleted/archived (`is_active = false`) to maintain historical financial and contract integrity.
    - Role-based permissions: Sales representatives receive a clean read-only view, while management controls are reserved for `GM` and `ADMIN` roles.
  - **Lead Sources Editing & Deletion**:
    - Added **Edit Lead Source (تعديل المصدر)** dialog to rename marketing channels in Arabic and English.
    - Added **Delete Lead Source (حذف المصدر)** dialog with confirmation. Unused sources are deleted; sources linked to past clients or deals are safely archived to prevent foreign key errors and preserve pipeline analytics.
  - **Settings Page Dynamic Metadata**:
    - Converted static page metadata to locale-aware `generateMetadata` matching the active language.
  - **Server Actions & Database Security**:
    - Implemented `deleteService`, `updateLeadSource`, and `deleteLeadSource` with strict multi-layer GM/Admin authorization and database RLS alignment.
    - 100% synchronized translation keys between `messages/ar.json` and `messages/en.json`.
- **Sales Representative Training & Operations Manual (Egyptian Arabic)**:
  - Authored comprehensive 7-page manual (`docs/Nile_Nexus_Sales_Manual_Guide_AR.pdf` & `docs/SALES_REP_MANUAL_AR.md`) in motivating, professional Egyptian Arabic tailored specifically for company sales representatives.
  - Covers: Morning Routine, Profile setup, Potential Clients qualification & 1-click conversion, 6-stage Pipeline Kanban, Daily Follow-ups with 1-click WhatsApp/Call, 2-minute Commercial Proposal creation with GM discount rules (>5%), and the 7 Golden Rules for winning deals.
  - Formatted with Cairo Arabic typography, optimal readability font size, structured callouts, tables, and workflow badges.
  - Automated PDF compilation engine via `scripts/generate-sales-manual-pdf.mjs`.



## [1.1.0] - 2026-10-11

### Added & Enhanced
- **Full 14-Tab Mobile Navigation Drawer & Bottom Bar "More" (المزيد) Integration**:
  - Solved the mobile navigation limitation where only 5 tabs were previously visible and the other 9 tabs (`Potential Clients`, `Pipeline`, `Tasks`, `Calendar`, `Proposals`, `Approvals`, `Team`, `Reports`, `Settings`) were inaccessible on smartphones.
  - **Mobile Slide-Over Navigation Drawer**:
    - Accessible via the new hamburger menu button (☰) in the mobile top header or the 5th "More / المزيد" bottom bar tab.
    - Displays all 14 application sections with their corresponding Lucide icons, localized titles, and active route highlight.
    - Features user profile summary card with avatar, full name, email, and role badge (`GM`, `ADMIN`, `SALES`).
    - Integrated language switcher (عربي / English) and secure sign-out trigger directly inside the drawer footer.
    - Native RTL and LTR support: smoothly slides out from right in Arabic and from left in English.
    - Automatically closes on page navigation, backdrop touch, or `Escape` key press with body scroll lock.
  - **Enhanced Mobile Bottom Navigation**:
    - Keeps 4 high-frequency quick-access tabs (`Dashboard`, `Clients`, `Deals`, `Follow-ups`).
    - Replaced static 5th slot with dynamic "More / المزيد" trigger (`LayoutGrid` icon) with active status dot indicator whenever browsing secondary sections.
  - **Shared `MobileNavContext`**:
    - Clean React context managing open/close state between `AppHeader`, `AppSidebar`, and mobile bottom bar without prop drilling.
  - **Layout & Ergonomics Improvements**:
    - Added `pb-24 md:pb-6` bottom padding to `<main>` to ensure mobile page content and action buttons are never obscured by the fixed bottom navigation bar.
    - Synchronized `nav.more`, `nav.menu`, `nav.allSections`, and group keys across `messages/ar.json` and `messages/en.json`.


### Production Release & Demo Data Transition
- **Production Database Preparation Migration (`008_prepare_production_and_clean_demo_data.sql`)**:
  - Created transactional SQL migration to clean out all test/sample records (`potential_clients`, `clients`, `deals`, `proposals`, `follow_ups`, `tasks`, `approvals`, `notifications`, `activities`, `audit_logs`).
  - Purged placeholder seed users (`gm@nilenexus.com`, `admin@nilenexus.com`, `sales@nilenexus.com`).
  - Strictly preserved real corporate accounts: Mohamed Hamed (`hamedelagamy00@gmail.com`) and Reem Ezz (`ezzreem726@gmail.com`) with confirmed GM role, as well as all registered employees.
  - Strictly preserved all system configuration: pipeline stages, lead sources, lost reasons, services catalog, feature flags, permissions, and payment terms templates.
  - Reset all business ID counters (`number_sequences`) to `0` so production records begin sequentially at `00001` (`PC-00001`, `CLIENT-00001`, `DEAL-00001`, `NN-Q-00001`, `TASK-00001`).
- **Connected All Remaining Pages to Live Supabase Queries**:
  - `tasks/page.tsx`: Now queries `tasks` directly from Supabase, with a clean translated empty state when no tasks are assigned.
  - `calendar/page.tsx`: Now queries pending follow-ups and meetings directly from Supabase, computing live agenda stats and displaying a clean empty state.
  - `approvals/page.tsx`: Now queries `approvals` table live from Supabase, displaying pending discounts and payment exceptions.
  - `reports/page.tsx`: Computes live closed revenue, open pipeline, average deal size, conversion rate, and sales representative leaderboard directly from database records.
  - `notifications/page.tsx`: Now queries user notifications directly from Supabase for the authenticated employee.
  - **Zero** `.tsx` components in the application import or rely on mock demo data.
- **Translation Parity & Quality Gates**:
  - 100% key parity maintained: 787 keys in both `messages/ar.json` and `messages/en.json` (0 missing).
  - TypeScript strict check: 0 errors (`npx tsc --noEmit`).
  - Vitest test suite: 60/60 tests passing across 13 suites.

## [0.9.4] - 2026-10-10

### Fixed & Enhanced
- **Comprehensive Application-wide Localization & Content Revision**:
  - Achieved 100% translation key parity between `messages/ar.json` and `messages/en.json` (779 keys in each, 0 missing).
  - Eliminated all hardcoded bilingual slash labels and parenthetical text across the application (e.g., `العميل / Client` → dynamic `{t("client")}`, `كتالوج الخدمات (Services)` → `{t("servicesCatalogTitle")}`).
  - Replaced hardcoded date locales (e.g., `toLocaleDateString("ar-EG")`) with locale-aware formatting (`toLocaleDateString(undefined, ...)`).
  - Fully localized every module:
    - **Auth & Header**: Clean role titles (`المدير العام`, `مدير النظام`, `مسؤول المبيعات` / `General Manager`, `Administrator`, `Sales Representative`), translated login form errors and inputs.
    - **Potential Clients**: Dynamic status badges, opportunity tags, creation wizard, and detail view.
    - **Clients & Contacts**: Type badges, contact creation and detail cards.
    - **Deals & Pipeline**: Dynamic deal stage badges without hardcoded Arabic fallbacks, creation dialog, and pipeline kanban board.
    - **Follow-ups Daily Workspace**: Filter tabs, follow-up cards, action badges, and complete / reschedule / create modals.
    - **Commercial Proposals**: Creation wizard, proposal builder, status badges, overview cards, and print/PDF view.
    - **Team & Settings**: Services catalog, lead sources manager, and team member management cards.
    - **Approvals & Reports**: Approvals request cards, client labels, and sales funnel stages.
  - Typecheck passed with 0 errors (`npx tsc --noEmit`) and all 60 Vitest tests passing across 13 test suites.

## [0.9.3] - 2026-10-09

### Fixed
- **Profiles RLS & Profile Saving Fix**:
  - Replaced `.upsert()` with resilient update-first logic in `src/lib/actions/profile.ts` so modifying phone, name, or avatar uses the existing `profiles_update_own` RLS policy (`id = auth.uid()`) without triggering PostgreSQL's `INSERT` RLS policy check.
  - Added support for `createAdminClient()` fallback in profile and team server actions when `SUPABASE_SERVICE_ROLE_KEY` is configured.
  - Created migration `supabase/migrations/007_fix_profiles_rls_and_insert_policy.sql` to define missing `profiles_insert_own`, `profiles_insert_admin`, and `profiles_delete_gm` policies, and backfill any missing profile records from `auth.users`.
  - Synchronized `002_rls_policies.sql` and `all_in_one_deploy.sql` with the new profile policies.
- **Resolved 494 REQUEST_HEADER_TOO_LARGE (Cookie Size Overflow)**:
  - Disallowed storing base64 data URLs in `supabase.auth.updateUser` metadata, keeping the JWT session cookie below 1KB and permanently preventing Vercel's 16KB header size limit breach.
  - Added `uploadAvatar` server action to upload profile pictures directly to Supabase Storage `avatars` bucket.
  - Added migration SQL in `007` to clean up oversized `avatar_url` from `auth.users.raw_user_meta_data` and configure public storage policies for `avatars`.

## [0.9.2] - 2026-10-09

### Fixed
- **Bilingual Language Consistency & Localization**:
  - Eliminated hardcoded Arabic strings across all auxiliary pages (`/calendar`, `/tasks`, `/approvals`, `/reports`, `/notifications`, `/team`, and `/settings`).
  - Switched static demo and placeholder content to dynamic `next-intl` translation keys (`getTranslations` and `useTranslations`).
  - Removed bilingual parenthetical labels (e.g. `(Profile Picture)`, `(Demo Presentation)`) to guarantee pure Egyptian Arabic in `ar` mode and pure English in `en` mode.
  - Added complete translation dictionaries for `calendar`, `tasks`, `approvals`, `reports`, `notifications`, `team`, and `settings` in both `messages/ar.json` and `messages/en.json`.
  - Maintained 100% test coverage with 60/60 Vitest tests passing across 13 test suites.

## [0.9.1] - 2026-10-09

### Security & Roles
- **Locked Public Registration to Sales Role**:
  - Removed the role selection dropdown from public signup (`src/components/auth/login-form.tsx`).
  - Hardcoded public signups strictly to `role: "SALES"` on both client and auth metadata.
  - Added security notice that administrative roles (GM, Admin) can only be assigned by the General Manager.
  - Hardened database trigger `handle_new_user()` in `supabase/migrations/006_create_gm_reem_ezz_and_secure_signup.sql` to strictly force `'SALES'` for all public signups.
- **GM Account for Reem Ezz**:
  - Pre-registered and configured GM account for Reem Ezz (`ezzreem726@gmail.com`) with `NileNexus2026!`.
  - Confirmed GM role for Mohamed Hamed (`hamedelagamy00@gmail.com`).
  - Added Reem Ezz and Mohamed Hamed to mock/demo dataset in `src/lib/demo-data.ts`.

## [0.9.0] - 2026-10-09

### Added & Enhanced
- **Device Photo Upload & Avatar Customization**:
  - Implemented direct photo upload from user device (`<input type="file" accept="image/*">`) in `src/components/settings/user-profile-form.tsx`.
  - Added interactive avatar circle with hover camera overlay for 1-click photo replacement.
  - Added smart client-side HTML5 canvas center-crop and compression (320x320 JPEG, 85% quality, ~25KB-35KB) for instant loading, zero storage bucket dependencies, and seamless rendering everywhere.
  - Enhanced `src/app/(authenticated)/layout.tsx` to query live `profiles` table directly, ensuring user avatar and name update immediately across `AppHeader` without delay.
  - Integrated `router.refresh()` in profile update flow for instantaneous UI synchronization.

## [0.8.1] - 2026-10-06

### Fixed & Enhanced
- **Live Supabase Connection**:
  - Sanitized UTF-8 Byte Order Mark (BOM) from environment variables on Vercel CLI.
  - Verified live database query against Supabase project `zbbivheqcutwflewmtnb` returning HTTP 200 and `dbStatus: "connected"`.
  - Application header now displays live green badge: **"Supabase متصل"** (Arabic) / **"Supabase Connected"** (English).
- **Internationalization (i18n) & Broken Language Fix**:
  - Fixed bilingual language toggling between Egyptian Arabic (RTL) and English (LTR).
  - Fully translated dashboard KPIs, greeting, quick action buttons, deal stages, and table headers.
  - Replaced raw database status codes with localized labels across all modules.
- **Authentication & User Seeding**:
  - Enabled seamless 1-click Quick Login (GM, Admin, Sales) to access dashboard and live tables immediately.
  - Created `supabase/migrations/004_create_initial_admin_users.sql` to seed pre-confirmed accounts (`gm@nilenexus.com`, `admin@nilenexus.com`, `sales@nilenexus.com`) and sample CRM data.


### Added
- **Production Deployment to Vercel**:
  - Successfully linked and created production project `nile-nexus-sales` under account `hamed-elagamy`
  - Deployed live application to Vercel Production: [https://nile-nexus-sales.vercel.app](https://nile-nexus-sales.vercel.app)
  - Configured live production environment variables on Vercel:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - Verified live endpoint responsiveness with HTTP 200/307 redirects
- **Supabase Integration Updates**:
  - Added support for new Supabase publishable key format (`sb_publishable_...`) across client, server, and middleware
  - Created consolidated single-run deployment migration `supabase/migrations/all_in_one_deploy.sql`
  - Initialized `supabase/config.toml`

## [0.7.0] - 2026-10-05

### Added
- **Zero-Config Standalone Demo Mode**:
  - Offline/demo fallback architecture allowing the application to run smoothly and interactively without needing live Supabase credentials
  - 1-Click Quick Demo Login on `/login` supporting GM (المدير العام), Admin (المشرف), and Sales (مسؤول المبيعات) with instant role switching
  - Database status indicator badge in the main application header (Demo Mode vs Supabase Connected) with drawer for connecting live credentials
- **Completed All Auxiliary Routes (Zero 404 Navigation)**:
  - `/tasks`: Sales task manager with urgency filtering (عاجل، هام، عادي), status tracking, and deal linkage
  - `/calendar`: Commercial agenda for meetings, demos, calls, and deadlines
  - `/approvals`: Management approvals center for discounts >5% and payment terms exceptions
  - `/reports`: Conversion funnel analysis, EGP revenue indicators, and representative leaderboard
  - `/notifications`: Real-time notification and system alert center
- **Rich Egyptian Commercial Dataset**:
  - Realistic companies, pipeline deals with values in EGP, today/overdue follow-up actions, commercial quotations with 14% VAT, approvals, and tasks
- **Dual-Mode Server Actions**:
  - Transparent dual-mode execution for `dashboard.ts`, `team.ts`, `settings.ts`, `potential-clients.ts`, `clients.ts`, `deals.ts`, `follow-ups.ts`, and `proposals.ts`
  - Strict preservation of the Supabase data path when credentials exist, with full test-mock support
- **Quality Assurance & Verification**:
  - 100% test pass rate (60/60 Vitest tests)
  - 0 TypeScript errors (`tsc --noEmit`)
  - 0 ESLint errors and warnings
  - Production build successfully compiling all 21 routes with Next.js Turbopack

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
