# CareerBloom AI

A browser-based career readiness workspace that helps students explore roles, build skills, follow a roadmap, plan daily actions, analyze resumes locally, and track progress.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/career-bloom/` — CareerBloom AI frontend application
- `README.md` — local setup, feature summary, limitations, and deployment notes

## Architecture decisions

- Career readiness demo data and progress are browser-local; no backend or AI API is required.
- Resume extraction and role matching are presented as local, rule-based demo analysis, not an ATS score or real AI result.

## Product

Students can choose a target career, assess their skills, follow and complete roadmap milestones, plan tasks, review resume matches, chat with a local demo coach, and view progress derived from their activity.

## User preferences

- Keep the CareerBloom AI interface simple, clean, and attractive.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
