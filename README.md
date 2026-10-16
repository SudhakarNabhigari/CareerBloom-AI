# CareerBloom AI

A browser-based career readiness workspace for students. Explore career paths, assess your skill gaps, follow a practical roadmap, plan daily tasks, analyze your resume locally, and track your progress over time — all without a backend or account.

## Features

- **Career discovery** — Browse and select from 12+ role profiles across AI/Data, Engineering, Design, Product, Cloud, and Security
- **Skill gap assessment** — Self-rate your skills against role targets with clear, honest readiness metrics
- **Learning roadmap** — A practical 4-week milestone plan that adapts to your chosen career
- **Daily planner** — Create, edit, and complete tasks with priorities and due dates
- **Resume analyzer** — Extract and locally match resume text against role requirements (no data leaves your browser)
- **Progress analytics** — Charts and stats built from your in-app activity
- **Career coach** — A clearly-labelled local demo coach with role-aware suggestions
- **Responsive** — Works on desktop and mobile

> **Privacy:** All data (accounts, assessments, tasks, progress) is stored in your browser's `localStorage`. No backend, database, or API keys are required.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [pnpm](https://pnpm.io/) v9 or later (`npm install -g pnpm`)

## Installation

```bash
# Clone the repository
git clone https://github.com/SudhakarNabhigari/CareerBloom-AI.git
cd CareerBloom-AI

# Install dependencies
pnpm install
```

## Local Development

```bash
pnpm run dev
```

The app starts at **http://localhost:5000** by default. If port 5000 is busy, Vite will pick the next available port and display it in the terminal.

## Production Build

```bash
pnpm run build
```

Build output is written to `artifacts/career-bloom/dist/public/`.

## Preview Production Build

```bash
pnpm run preview
```

## TypeScript Check

```bash
pnpm run typecheck
```

## Environment Variables

This app does **not** require any environment variables to run. All functionality is browser-local.

If you want to customize the dev server port, create a `.env` file in `artifacts/career-bloom/`:

```
PORT=3000
BASE_PATH=/
```

See [`.env.example`](.env.example) for the full list.

## Project Structure

```
CareerBloom-AI/
├── artifacts/
│   └── career-bloom/          # Main application
│       ├── src/
│       │   ├── App.tsx        # Root component + all pages
│       │   ├── main.tsx       # Entry point
│       │   ├── index.css      # Global styles
│       │   ├── components/    # Shared UI components (shadcn/ui based)
│       │   ├── data/          # Career data model and state
│       │   ├── hooks/         # React hooks (state persistence)
│       │   ├── lib/           # Utility functions
│       │   └── pages/         # 404 not-found page
│       ├── index.html
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
├── lib/                       # Workspace scaffolding (boilerplate, not used by app)
│   ├── api-client-react/      # Generated API client (for future backend)
│   ├── api-spec/              # OpenAPI spec (for future backend)
│   ├── api-zod/               # Zod validators (for future backend)
│   └── db/                    # Drizzle DB setup (for future backend)
├── vercel.json                # Vercel deployment config
├── package.json               # Root scripts
├── pnpm-workspace.yaml        # Workspace config
└── README.md
```

## Deployment

### Vercel (recommended)

1. Import the repository into [Vercel](https://vercel.com).
2. Vercel will auto-detect the `vercel.json` at the root.
3. No environment variables are needed.
4. Deploy — done.

### Manual / Other Hosts

Build the app:

```bash
pnpm install
pnpm run build
```

Then serve `artifacts/career-bloom/dist/public/` as a static site. Configure your host to serve `index.html` for all routes (SPA fallback).

## Data and Limitations

Career profiles, skill targets, roadmap milestones, and coaching responses are **predefined demo data** — no remote AI service is called. Resume analysis uses local text extraction and configured role keywords; it is not an ATS score or a measure of actual job readiness.

Demo accounts use browser-side PBKDF2 password hashing stored in `localStorage`. This is **not** production authentication.

Use the **Settings** page to reset all demo data for the current browser.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** + **Tailwind CSS v4**
- **Wouter** — client-side routing
- **Recharts** — analytics charts
- **shadcn/ui** (Radix UI primitives)
- **Lucide React** — icons
- **pnpm** — package management
