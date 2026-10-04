# Nile Nexus Sales

Internal sales management platform for Nile Nexus — replacing Excel-based workflows with a modern, production-grade web application.

## 🚀 Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript (strict)
- **Styling**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- **Validation**: Zod, React Hook Form
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel

## 🌍 Languages

- **Arabic** (Egyptian colloquial) — default
- **English** — secondary
- Runtime switching, RTL/LTR support

## 👥 User Roles

| Role | Access |
|------|--------|
| GM | Full company-wide access |
| ADMIN | Full company-wide access (distinct role for future permission divergence) |
| SALES | Ownership-based workspace access |

## 📋 Core Modules

- Potential Clients / Research Pool
- Client Management (Company / Individual)
- Deals & Pipeline (Kanban + List)
- Follow-ups & Activities
- Tasks & Calendar
- Proposals / Quotations (versioned, PDF)
- Discount Approvals
- Finance Handoff
- Notifications
- Reports & Analytics
- Team Management
- Settings & Configuration
- Audit Log

## 🔧 Getting Started

### Prerequisites

- Node.js 22+
- npm 10+
- Supabase account & project

### Setup

```bash
# Clone the repository
git clone https://github.com/Hamed-Elagamy/Nile_Nexus_Sales.git
cd Nile_Nexus_Sales

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

### Environment Variables

See [.env.example](.env.example) for required variables.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run Vitest tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run format` | Format code with Prettier |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (authenticated)/    # Protected route group
│   ├── auth/               # Auth callback routes
│   └── login/              # Public login page
├── components/             # React components
│   ├── auth/               # Auth-related components
│   ├── layout/             # Layout (sidebar, header)
│   ├── providers/          # Context providers
│   ├── shared/             # Shared/reusable components
│   └── ui/                 # shadcn/ui base components
├── i18n/                   # Internationalization
├── lib/                    # Utilities and services
│   └── supabase/           # Supabase client instances
├── test/                   # Test setup and utilities
└── types/                  # TypeScript type definitions

messages/                   # i18n translation files (ar, en)
supabase/                   # Database migrations
docs/                       # Project documentation
```

## 📖 Documentation

- [Product Specification](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database Design](docs/DATABASE.md)
- [Security & RLS](docs/RLS_SECURITY.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Testing](docs/TESTING.md)
- [Decisions](docs/DECISIONS.md)

## 📊 Project Status

See [PROJECT_STATE.md](PROJECT_STATE.md) for current development status.

## 📜 License

Proprietary — Nile Nexus internal use only.
