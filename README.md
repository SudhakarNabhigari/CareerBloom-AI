# CareerBloom AI

CareerBloom AI helps students explore a career, understand skill gaps, follow a practical roadmap, plan daily work, review a resume locally, and track their progress.

## Run locally

This app is a frontend-only React + Vite application in a pnpm workspace.

```bash
pnpm install
pnpm --filter @workspace/career-bloom run dev
```

Useful checks:

```bash
pnpm --filter @workspace/career-bloom run typecheck
pnpm --filter @workspace/career-bloom run build
```

## Features

- Local demo registration and login, with browser-side password hashing
- Career discovery, search, selection, and career-specific skill requirements
- Self-assessed skill gaps and role-based learning recommendations
- Roadmap milestones with completion tracking
- Daily planner with task creation, editing, completion, due dates, and priorities
- Local resume text extraction and transparent rule-based career matching
- Analytics based on recorded app activity
- A clearly labelled local demo career coach
- Responsive layouts for desktop and mobile

## Data and limitations

This is a browser-only demonstration. Career information and coaching recommendations are predefined examples; no remote AI service is called. Resume analysis uses extracted text and configured role requirements, so it is not an authoritative ATS score or a guarantee of job readiness.

Demo account metadata, assessments, planner tasks, roadmap progress, and analytics are stored in the browser's `localStorage`. This is not production authentication or secure multi-device storage. Resume analysis is performed locally; use the app's clear/remove controls when you no longer want its extracted text or results retained in this browser.

Use Settings to reset the demo data for the current browser.

## Deployment

The app is configured as a static Vite build with SPA fallback rewrites. For Vercel:

1. Import the repository into Vercel.
2. Set the root directory to the repository root.
3. Use `pnpm install` as the install command.
4. Use `pnpm --filter @workspace/career-bloom run build` as the build command.
5. Set the output directory to `artifacts/career-bloom/dist/public`.

The app does not require a backend, database, API key, or environment variables.
