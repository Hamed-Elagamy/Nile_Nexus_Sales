# Architecture Decision Records (ADRs)

1. **Next.js App Router over Pages Router**
   - **Rationale**: Server components, streaming, modern patterns.

2. **Supabase over custom backend**
   - **Rationale**: Managed PostgreSQL, auth, storage, realtime, RLS.

3. **shadcn/ui over MUI/Ant**
   - **Rationale**: Copy-paste components, full customization, Tailwind native.

4. **Arabic-first i18n with next-intl**
   - **Rationale**: Runtime switching, ICU message format.

5. **UUID PKs with separate business IDs**
   - **Rationale**: Data integrity, safe business ID changes.

6. **Client ≠ Deal model**
   - **Rationale**: One client can have multiple sales opportunities.

7. **Immutable proposal versions**
   - **Rationale**: Audit trail, legal compliance.

8. **Finance boundary**
   - **Rationale**: Sales stops at agreement, Finance handles invoicing.

9. **Decimal.js for money**
   - **Rationale**: Avoid floating point errors in commercial calculations.

10. **Server Components by default**
    - **Rationale**: Minimize client bundle, improve security.
