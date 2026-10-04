# Next Task

## Goal
Initialize Next.js 15 project with App Router, TypeScript strict mode, Tailwind CSS, ESLint, and Prettier. Then install and configure shadcn/ui, Lucide icons, and Supabase client libraries.

## Relevant Files
- `package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `components.json` (shadcn config)
- `.eslintrc.json`
- `.prettierrc`
- `.env.local`

## Acceptance Criteria
- Build passes (`npm run build`).
- Lint passes (`npm run lint`).
- Typecheck passes (`tsc --noEmit`).
- Project runs locally without errors.
- shadcn/ui is configured and ready for component installation.

## Commands to Run After
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
npx shadcn-ui@latest init
npm install @supabase/supabase-js @supabase/ssr
npm run build
npm run lint
```
