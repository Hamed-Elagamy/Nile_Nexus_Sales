# Database Design

## Planned Tables
- `users` (managed by Supabase Auth, extended with `profiles`)
- `clients` (id, business_id, name, contact_info, archived_at)
- `deals` (id, client_id, status, amount, expected_close_date, archived_at)
- `proposals` (id, deal_id, version, content, status, is_locked, archived_at)
- `tasks` (id, user_id, related_entity_id, type, due_date, status)
- `outbox_events` (id, payload, status, created_at)

## Relationships
- A `client` has many `deals`.
- A `deal` has many `proposals`.
- A `user` has many `tasks` and `deals`.

## Naming Conventions
- `snake_case` for all table and column names.
- Timestamps: `created_at`, `updated_at`, `archived_at`.
- Soft Delete: Enforced via `archived_at IS NULL` clauses in RLS or views.

## Business ID Numbering System
Internal primary keys are UUIDs. Human-readable IDs (e.g., `CLI-1001`, `PRP-2026-001`) are generated sequentially for display purposes.

## Key Indexes
- Indexes on `client_id` in `deals`.
- Indexes on `deal_id` in `proposals`.
- Indexes on `archived_at` to optimize active record filtering.

## Migration Strategy
All schema changes must be managed via Supabase CLI migrations. Local development -> generate migration -> push to remote.
