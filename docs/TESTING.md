# Testing Strategy

## Unit Tests (Vitest)
- Focus on utilities, formatters, and complex business logic (e.g., Decimal.js calculations).
- Test standalone React components that do not rely on complex context.

## Integration Tests
- Test Server Actions interacting with a local Supabase test database.
- Validate form submissions and error handling.

## RLS Tests
- Ensure database policies work correctly by asserting access under different mock user roles.

## E2E Tests (Playwright)
- Test critical user journeys in the browser.
- E.g., Logging in, creating a lead, moving a deal through the pipeline, generating a proposal.

## Critical Test Scenarios List
1. Sales rep cannot view another rep's private deals.
2. Proposal becomes immutable once marked as sent.
3. Amount calculations do not suffer from floating point errors.
4. UI switches correctly between Arabic (RTL) and English (LTR).

## Test Data Strategy
- Use Supabase seed files (`supabase/seed.sql`) for local development and integration test database initialization.
