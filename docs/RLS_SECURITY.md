# RLS Security Architecture

## Strategy
Row Level Security (RLS) must be enabled on ALL business tables.

## RLS Strategy Per Role
- **GM**: Policies allowing `SELECT`, `INSERT`, `UPDATE` across most tables.
- **ADMIN**: System-wide access, similar to GM, possibly excluding some sensitive reporting.
- **SALES**: Policies restricting access to rows where `user_id = auth.uid()` or where they are assigned as part of a deal team.

## Policy Patterns
- **Ownership**: `auth.uid() = owner_id`
- **Company-Wide**: Accessible if user is active and belongs to the company tenant (if multi-tenancy is adopted, though currently single-company).

## Storage Security
Supabase Storage buckets must have RLS policies restricting file uploads to authenticated users and file reads to relevant roles (e.g., proposal PDFs).

## Server-Side Authorization
Even with RLS, Server Actions must verify user permissions and roles before proceeding with complex business logic.

## SECURITY DEFINER Function Guidelines
Use `SECURITY DEFINER` sparingly for bypass operations (e.g., generating sequential business IDs). Always explicitly set the `search_path` to avoid search path injection attacks.

## Testing Requirements
RLS policies must be verified using pgTAP or automated tests interacting with the database under different authenticated roles.
