# CareerBloom AI

A browser-only career-readiness workspace for college students. The app runs on React, Vite, TypeScript, Tailwind CSS, Recharts, and Lucide icons. There is no backend, remote API, or required API key.

## Run locally

From this directory:

```bash
pnpm install
PORT=5173 BASE_PATH=/ pnpm dev
```

The scaffold requires `PORT` and `BASE_PATH` when starting Vite. To create a production build:

```bash
PORT=5173 BASE_PATH=/ pnpm build
```

## Features

- Local demo registration and login, including password confirmation and a show/hide control.
- Browser-side PBKDF2 password hashing when Web Crypto is available. Demo credentials and app state use local storage; this is not secure authentication. Do not reuse a real password.
- Welcome onboarding, searchable selection of 12 role profiles, career switching, and role-specific skill requirements and roadmaps.
- Self-rated skill assessment with transparent target comparison and timestamped check-ins.
- Roadmap milestone completion and persistent task planner CRUD.
- Local PDF/DOCX resume text extraction and exact role-skill phrase matching. No ATS score, AI assessment, or hiring prediction is provided. Scanned PDFs and uncommon encodings may not be readable. Resume text is stored locally until cleared.
- Rule-based local career-coach suggestions, clearly identified as a demo and not a real AI service.
- Recharts analytics derived from actual saved check-ins, tasks, and roadmap actions. New users see an empty state rather than invented history.
- Profile editing, logout, and demo-data reset.

## Data and architecture

`src/data/model.ts` contains role profiles, skill expectations, roadmap templates, persistence types, readiness calculation, and recommendation logic. `src/hooks/useCareerBloom.ts` centralizes local-storage state. `src/App.tsx` contains the route-level workspace, accessible navigation, and feature screens. `src/index.css` defines the light lavender-and-blue design system and responsive layout.

All main routes are supported: `/login`, `/register`, `/select-career`, `/dashboard`, `/careers`, `/skills`, `/roadmap`, `/planner`, `/resume`, `/analytics`, `/coach`, and `/settings`.

## Deployment

Deploy the Vite project from this directory with the build command `PORT=5173 BASE_PATH=/ pnpm build` and output directory `dist/public`. Configure the hosting provider to rewrite application routes to `/index.html` for client-side navigation.

## Limitations

This is a frontend demonstration, not production authentication. PDF text extraction handles common text-based PDFs but may not read scanned documents or nonstandard encodings. Resume matching checks exact configured skill names only. Coaching is deterministic local recommendation logic, not a real AI model. Data is stored in the current browser profile and is not synced between devices.
