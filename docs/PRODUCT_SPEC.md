# Product Specification: Nile Nexus Sales

## Product Overview
Nile Nexus Sales is an internal sales management platform designed to replace legacy Excel workflows. It enables end-to-end tracking of potential clients, deal pipelines, and formal proposals.

## User Roles & Permissions
- **GM (General Manager)**: Full access, broad reporting, approval powers.
- **ADMIN**: System configuration, user management, overriding standard workflows.
- **SALES**: Restricted to own deals/clients, can create proposals, perform follow-ups.

## Core Modules
- **Potential Clients (Leads)**: Initial contacts before a formal relationship.
- **Clients**: Verified entities with which Nile Nexus has or will have business.
- **Deals / Pipeline**: Opportunities attached to a client. Includes stage tracking.
- **Follow-ups / Tasks**: Reminders and activity logs for sales reps.
- **Meetings**: Scheduled interactions.
- **Proposals**: Formal documents sent to clients (immutable versions).
- **Approvals**: Workflows for GM/Admin to approve discounts or special terms.
- **Reports**: Dashboard analytics for sales performance.

## Key Business Rules
- **Client ≠ Deal**: A single client entity can have multiple distinct deals.
- **Immutable Proposals**: Once a proposal is sent or accepted, it cannot be modified. A new version must be created.
- **No Hard Deletes**: Records are deactivated via `archived_at` or lifecycle statuses.
- **Finance Boundary**: The system stops at deal closure/agreement. It does not generate invoices or process payments.

## Integration Architecture
- Prepared for an Outbox pattern to integrate with future external finance or ERP systems.

## UI/UX Requirements
- **Default Language**: Arabic (Egyptian colloquial).
- **Secondary Language**: English.
- **RTL/LTR Support**: Full runtime switching support for layout and text direction.
