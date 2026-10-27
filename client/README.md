# TaskFlow — Client

Next.js (App Router) frontend for TaskFlow. See the [root README](../README.md) for the full project overview, API details and roadmap.

## Setup

```bash
npm install
```

Create `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Dev server on port 3000  |
| `npm run build` | Production build         |
| `npm run start` | Run the production build |
| `npm run lint`  | Run ESLint               |

## Structure

- `app/` — routes. Private pages live in the `(app)` group, which is guarded by `AppShell`.
- `components/` — reusable UI (`ui.tsx`), auth (`AuthProvider`, `AuthForm`), layout (`AppShell`) and task components.
- `lib/api.ts` — the single API client (`credentials: "include"`, standard envelope handling).
- `lib/auth.ts`, `lib/tasks.ts` — small typed service wrappers.
- `types/` — shared types (`ApiResponse`, `User`, `Task`).
