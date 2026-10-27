# TaskFlow

TaskFlow is a full-stack task management application. Users can create an account, log in securely, and manage their work from a clean dashboard.

> **Status:** Authentication and the full frontend are done. The task API (`/api/tasks`) is not built yet, so the task screens show a "not connected" state until it exists. See [Roadmap](#roadmap).

## Features

- Account registration, login, logout and session check (`/auth/me`)
- Secure cookie-based auth (HTTP-only JWT cookie, never exposed to JavaScript)
- Dashboard with summary cards and progress
- Task list and board views with search, filters and sorting
- Task details page with edit and delete
- Responsive layout (desktop sidebar, mobile drawer)
- Standardized API response format, input validation and rate limiting on auth routes

## Tech stack

| Area     | Technology                                                              |
| -------- | ----------------------------------------------------------------------- |
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, lucide-react     |
| Backend  | Node.js, Express 5, TypeScript, Zod                                     |
| Database | MongoDB with Mongoose                                                   |
| Auth     | bcryptjs password hashing, JWT in an HTTP-only cookie (`taskflow_token`) |
| Security | Helmet, CORS (credentials), express-rate-limit                          |

## Project structure

```text
TaskFlow/
├── client/                 # Next.js frontend
│   ├── app/                # Routes: /, /login, /register, (app)/dashboard, tasks, settings
│   ├── components/         # UI components, AuthProvider, AppShell, task components
│   ├── lib/                # api.ts (API client), auth.ts, tasks.ts, format.ts
│   └── types/              # Shared TypeScript types
├── server/                 # Express backend
│   └── src/
│       ├── config/         # Database connection
│       ├── controllers/    # Route handlers
│       ├── middleware/     # Auth middleware
│       ├── models/         # Mongoose models
│       ├── routes/         # Express routers
│       ├── utils/          # apiResponse, asyncHandler
│       └── validators/     # Zod schemas
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- A MongoDB database (local or MongoDB Atlas)

### 1. Clone and install

```bash
git clone https://github.com/Manormasharma/TaskFlow.git
cd TaskFlow

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

**`server/.env`**

```dotenv
PORT=5050
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=replace-with-a-random-string-of-at-least-32-characters
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**`client/.env.local`**

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

Notes:

- `JWT_SECRET` must be at least 32 characters. Never commit real secrets.
- `CLIENT_URL` must exactly match the frontend origin, otherwise the browser will block cookie-based requests (CORS). The server default is `http://localhost:5000`, so set it to `http://localhost:3000` for local development.

### 3. Run the app

In two terminals:

```bash
# Terminal 1 - API (http://localhost:5050)
cd server
npm run dev

# Terminal 2 - Frontend (http://localhost:3000)
cd client
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Location | Command           | Description                    |
| -------- | ----------------- | ------------------------------ |
| `client` | `npm run dev`     | Start the frontend dev server  |
| `client` | `npm run build`   | Production build               |
| `client` | `npm run start`   | Run the production build       |
| `client` | `npm run lint`    | Run ESLint                     |
| `server` | `npm run dev`     | Start the API with auto-reload |
| `server` | `npm run build`   | Compile TypeScript to `dist/`  |
| `server` | `npm run start`   | Run the compiled API           |
| `server` | `npm test`        | Run tests (Vitest)             |

## API

Base URL: `http://localhost:5050/api`

### Response format

Every response uses the same envelope:

```json
{
  "message": "Profile details fetched successfully",
  "error": false,
  "error_code": "000",
  "data": { "user_id": "…", "full_name": "Demo User", "email": "demo@example.com" },
  "formatting_args": null
}
```

On failure, `error` is `true`, `error_code` describes the problem (for example `VALIDATION_ERROR`, `USER_EXISTS`, `INVALID_CREDENTIALS`) and `data` is usually `null`.

### Endpoints

| Method | Path             | Auth | Description                                     |
| ------ | ---------------- | ---- | ----------------------------------------------- |
| GET    | `/health`        | No   | Health check                                    |
| POST   | `/auth/register` | No   | Create an account (`name`, `email`, `password`) |
| POST   | `/auth/login`    | No   | Log in (`email`, `password`)                    |
| POST   | `/auth/logout`   | No   | Clear the auth cookie                           |
| GET    | `/auth/me`       | Yes  | Get the current user                            |

Validation rules: name 2–80 characters, valid email, password 8–72 characters.

## Roadmap

The frontend is already written against this contract. These endpoints still need to be built:

| Method | Path         | Description         |
| ------ | ------------ | ------------------- |
| GET    | `/tasks`     | List the user's tasks |
| POST   | `/tasks`     | Create a task       |
| GET    | `/tasks/:id` | Get one task        |
| PATCH  | `/tasks/:id` | Update a task       |
| DELETE | `/tasks/:id` | Delete a task       |

Expected task shape (inside `data`):

```ts
{
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}
```

Other ideas: profile update, password reset, tests for the frontend, AWS deployment.

## Security notes

- The JWT lives only in an HTTP-only cookie. The frontend never reads or stores it.
- Passwords are hashed with bcrypt and are never returned by the API.
- Frontend route protection is for UX only. The backend must enforce access on every private endpoint.
- In production, set `NODE_ENV=production` so cookies are sent with the `secure` flag (HTTPS required).

## License

ISC
