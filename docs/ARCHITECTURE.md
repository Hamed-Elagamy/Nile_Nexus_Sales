# Architecture Overview

## System Architecture Diagram
The system is built on a modern Serverless/Edge architecture using Next.js on Vercel, communicating with a managed Supabase backend.

## Directory Structure Plan
- `/src/app`: App Router pages, layouts, API routes.
- `/src/components`: UI components (shadcn), layouts, shared components.
- `/src/lib`: Utility functions, Supabase clients, formatters.
- `/src/types`: Global TypeScript types, database types.
- `/src/i18n`: next-intl configuration and dictionaries.
- `/supabase/migrations`: Database migrations.

## Data Flow
Client actions -> Server Actions -> Supabase -> UI updates via React Server Components. Form submissions handle validation using Zod on both client and server before interacting with the database.

## Auth Flow
Supabase Auth is used. Users log in via email/password. Middleware protects routes and ensures valid sessions. Roles are defined in user metadata or a dedicated `user_roles` table.

## Server vs Client Component Strategy
Default to React Server Components (RSC). Use Client Components (`"use client"`) only when interactivity, state (useState), or browser APIs are required.

## Supabase Client Strategy
- **Browser Client**: Used in client components (has RLS).
- **Server Client**: Used in Server Actions and RSC (has RLS, uses cookies).
- **Admin/Service Role**: Strictly limited to backend tasks requiring elevated privileges, bypassing RLS.

## i18n Architecture
Using `next-intl` for runtime translation switching and formatting.

## Feature Flag Architecture
Environment variables or a lightweight database table for toggling WIP features.

## Integration/Outbox Pattern
A dedicated `outbox_events` table to reliably sync closed deals to external finance systems in the future.

## Error Handling Strategy
Global error boundaries in Next.js, structured error responses from Server Actions, and user-friendly toast notifications on the client.
