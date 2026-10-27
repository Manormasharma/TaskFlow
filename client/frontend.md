# TaskFlow — Complete Frontend Development Prompt

Act as a senior frontend engineer and build a complete, polished, production-quality frontend for **TaskFlow**, a full-stack task management application.

## 1. Existing project and technology stack

The project already exists at:

`/Users/manormasharma/Documents/Github/TaskFlow`

The structure is:

```text
TaskFlow/
├── client/          # Existing Next.js frontend
├── server/          # Existing Express + TypeScript backend
├── .gitignore
└── README.md
```

Work primarily inside `client/`. Do not recreate the project or replace the existing backend.

Use:
- Next.js App Router
- TypeScript with strict type checking
- React
- Tailwind CSS, following the version and setup already installed
- Native Fetch API or the existing API helper
- Lucide icons if already installed; otherwise, add `lucide-react`
- Reusable components and custom hooks where appropriate

Inspect the existing project, `package.json`, `tsconfig.json`, Tailwind configuration, app structure, and backend routes before making changes. Reuse installed dependencies and existing conventions whenever possible.

Do not use React + Vite. This is an existing Next.js application.

## 2. Backend integration

The Express API runs locally at:

`http://localhost:5050/api`

The frontend environment variable is:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

Use `process.env.NEXT_PUBLIC_API_URL` rather than hardcoding the backend URL throughout the application.

The backend uses MongoDB, Mongoose, bcrypt password hashing, JWT authentication, and an HTTP-only cookie named `taskflow_token`.

The frontend must never read, store, or expose the JWT directly. Use cookie-based authentication with `credentials: "include"` for API requests.

The backend uses a standardized response envelope:

```json
{
  "message": "Profile details fetched successfully",
  "error": false,
  "error_code": "000",
  "data": {
    "user_id": "USER_ID",
    "full_name": "Demo User",
    "email": "demo@example.com"
  },
  "formatting_args": null
}
```

Error responses follow the same envelope, with `error: true`, a meaningful `error_code`, and usually `data: null`. Validation errors may include details in `formatting_args`.

Create or update a typed API client that:
- Supports GET, POST, PATCH, PUT, and DELETE.
- Includes cookies on API requests.
- Sets JSON headers when appropriate.
- Parses standardized API responses.
- Handles HTTP errors and application-level errors.
- Handles empty responses safely.
- Exposes useful error messages without exposing internal server details.
- Uses TypeScript generics for response types.
- Does not assume that a successful HTTP status always means the API operation succeeded.

Important existing authentication endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Registration and login accept the relevant fields:
- Registration: `name`, `email`, `password`
- Login: `email`, `password`

The successful authentication response returns the user inside `data`, using these fields:
- `user_id`
- `full_name`
- `email`

The `/auth/me` endpoint returns the currently authenticated user using the same standardized envelope.

Before implementing task-related functionality, inspect the backend to determine whether task endpoints exist. Do not invent endpoints or assume unsupported response shapes. If task endpoints are not implemented, build the frontend integration layer in preparation for them and document the missing backend requirements.

## 3. Design direction

Create a professional SaaS-style productivity application with a clean, modern, minimal interface.

Visual direction:
- Light background with subtle neutral surfaces
- Deep navy or charcoal text
- Blue or indigo primary accent
- Clear typography and consistent spacing
- Rounded cards and restrained shadows
- Consistent icons
- Responsive layouts for mobile, tablet, and desktop
- Accessible form controls, contrast, focus states, and keyboard navigation

Avoid excessive gradients, distracting animations, and oversized decorative elements.

Use a consistent design system with reusable buttons, inputs, cards, badges, dialogs, dropdowns, loading indicators, and empty states.

Create a cohesive visual experience rather than a collection of unrelated pages.

## 4. Required routes and pages

### A. Landing page — `/`

Create a polished public landing page with:
- TaskFlow logo and navigation
- Hero section explaining the product
- Primary call to action: “Get Started”
- Secondary action: “Log In”
- Feature cards describing task organization, productivity, and progress tracking
- A dashboard preview or illustrative UI composed from frontend components
- Footer with useful navigation

Do not claim features are fully functional unless the backend supports them.

### B. Registration — `/register`

Create a registration form with:
- Full name
- Email
- Password
- Password visibility toggle
- Client-side validation
- Password requirements and clear validation messages
- Loading state
- API error display
- Link to the login page

Submit to `POST /auth/register`.

On successful registration, redirect to `/dashboard`. If registration fails, display the API's message and allow the user to try again.

Never store the password in local storage or session storage.

### C. Login — `/login`

Create a login form with:
- Email
- Password
- Password visibility toggle
- Remember-me UI only if its behavior can be implemented correctly; otherwise omit it
- Loading state
- Validation
- Accessible error messages
- Link to registration

Submit to `POST /auth/login`.

On successful login, redirect to `/dashboard`.

Do not implement fake password-reset functionality. If no password-reset endpoint exists, show a clearly marked placeholder or omit the feature.

### D. Dashboard — `/dashboard`

Create a protected dashboard layout with:
- Sidebar navigation on desktop
- Responsive mobile navigation
- Top header
- User profile menu
- Welcome message using the current user's name
- Summary cards for total tasks, completed tasks, pending tasks, and overdue tasks
- Recent tasks section
- Task filters and search UI
- Quick action to create a task
- Useful loading, empty, and error states

Load the current user using `GET /auth/me`.

If the session is invalid or the API returns HTTP 401, redirect to `/login`.

Do not treat client-side route protection as the sole security mechanism. The backend must remain responsible for protecting private data.

If task APIs are missing, do not fabricate task records or present hardcoded sample tasks as real user data. Instead, show a helpful empty state or a clearly identified demo preview.

### E. Tasks — `/tasks`

Create a task management page with:
- List view
- Optional board view if practical
- Search
- Status filters
- Priority filters
- Sorting
- Task cards or rows
- Empty state
- Loading and error states
- Create, edit, view, and delete interactions where supported by the backend

Use a consistent task model, adapting to the existing backend schema if available.

Suggested fields, only if supported by the backend:
- Task ID
- Title
- Description
- Status
- Priority
- Due date
- Creation date
- Updated date

Possible statuses: Todo, In Progress, Completed.

Possible priorities: Low, Medium, High.

Do not make task mutations appear successful unless the backend confirms success. If the API does not yet support these operations, implement the UI and typed service interfaces, clearly indicate what is not connected, and document the backend endpoints required.

### F. Task details — `/tasks/[id]`

Create a task detail page or detail panel with:
- Task title and description
- Status
- Priority
- Due date
- Creation and update dates
- Edit action
- Delete action with confirmation
- Back navigation

Use the real task API if available. Handle invalid IDs, missing records, and server errors.

### G. Settings — `/settings`

Create a basic settings page with:
- Profile information
- Account email
- Account name
- Theme preference only if implemented properly
- Logout action

Do not expose sensitive account information.

If profile update endpoints are unavailable, make fields read-only rather than simulating a successful save.

### H. Not-found and error states

Implement:
- A branded 404 page
- Useful loading states
- Empty states
- Friendly error states
- Retry actions where appropriate
- Network failure handling

## 5. Authentication and session management

Implement a reliable authentication flow.

Requirements:
- Reuse the standardized API client.
- Load the current user through `/auth/me`.
- Handle expired sessions and HTTP 401 responses.
- Prevent repeated redirects and infinite request loops.
- Avoid exposing JWTs to JavaScript.
- Do not store passwords or tokens in browser storage.
- Clear client-side user state on logout.
- Submit logout to `POST /auth/logout`.
- Redirect to `/login` after a successful logout.
- Handle logout network errors gracefully.
- Prevent unauthenticated users from viewing private UI where appropriate.
- Avoid showing private information while the authentication state is unresolved.

Use an explicit authentication state, such as `loading`, `authenticated`, and `unauthenticated`, rather than treating the absence of a user during initial loading as proof that the user is logged out.

Because the application uses cookie-based authentication, ensure API calls use `credentials: "include"` and that the backend's CORS settings support the configured frontend origin.

## 6. Task API integration

First inspect the backend's routes, controllers, models, and response formats.

If task endpoints exist, integrate them exactly as implemented.

If task endpoints do not exist, prepare a typed API service layer and document the expected backend contract. Do not modify backend files without a clear need, and do not invent API success responses.

If implementing the frontend before the task backend is complete, keep the UI honest:
- Use explicit empty states.
- Clearly separate mock/demo content from real data.
- Never show mock data as if it came from the authenticated user's database.
- Make it easy to connect the real API later.

## 7. Code architecture

Use a maintainable folder structure similar to:

```text
client/src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── tasks/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── layout/
│   ├── auth/
│   ├── dashboard/
│   ├── tasks/
│   └── ui/
├── hooks/
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── tasks.ts
└── types/
    ├── auth.ts
    └── task.ts
```

Adapt this structure to the existing project instead of duplicating files or disrupting working code.

Use Server Components by default. Use Client Components only where interactivity, React state, event handlers, or browser APIs require them.

Keep components small and reusable. Avoid one enormous page component.

## 8. API response and TypeScript rules

Create shared response types for the standardized envelope:

```ts
export interface ApiResponse<T> {
  message: string;
  error: boolean;
  error_code: string;
  data: T | null;
  formatting_args: Record<string, unknown> | null;
}
```

Adjust types when actual backend responses require it.

For authentication:

```ts
export interface User {
  user_id: string;
  full_name: string;
  email: string;
}
```

Ensure the frontend uses the real response field names: `user_id` and `full_name`, not `id` and `name`.

Do not use `any` unless absolutely unavoidable. Use `unknown` for untrusted data and narrow its type before accessing fields.

Remember that TypeScript types do not validate API responses at runtime.

## 9. Accessibility and usability

Ensure:
- Every input has a proper label.
- Forms can be operated using a keyboard.
- Buttons have clear names.
- Focus indicators are visible.
- Errors are associated with relevant form controls where practical.
- Loading states are announced accessibly.
- Dialogs support keyboard interaction.
- Responsive navigation works on mobile.
- Destructive actions require confirmation.
- Dates and empty values are formatted consistently.

## 10. Testing and quality checks

After implementing the frontend:

1. Run the project's TypeScript checks.
2. Run ESLint if configured.
3. Run the production build.
4. Fix errors introduced by your changes.
5. Test registration.
6. Test login.
7. Test the current-user endpoint.
8. Test logout.
9. Test expired or missing sessions.
10. Test API failures and network disconnection.
11. Test responsive layouts.
12. Verify there are no hardcoded secrets.
13. Verify that task pages do not pretend missing backend functionality exists.

Use the existing package scripts whenever possible. Do not remove or weaken linting or TypeScript rules just to make the build pass.

## 11. Implementation workflow

Work directly in the existing repository.

Before coding:
- Inspect the project structure.
- Inspect installed dependencies.
- Inspect the current API helper.
- Inspect the actual backend routes and response formats.
- Identify what already works.

Then implement the frontend in logical stages:
1. Shared API client and types.
2. Global styles and reusable UI components.
3. Landing page.
4. Registration and login.
5. Authentication state and protected dashboard.
6. Task management pages.
7. Settings and logout.
8. Loading, error, and not-found pages.
9. Testing and final polish.

Do not stop after creating mockups or describing what should be built. Implement the actual files and functionality.

Do not overwrite working project files unnecessarily. Preserve existing authentication logic and environment configuration.

If an important backend feature is missing, implement the supported frontend portions and clearly report the missing API dependency rather than fabricating functionality.

## 12. Final deliverable

When finished, provide:
- A summary of pages and features implemented.
- The important files created or modified.
- Any backend endpoints that still need to be built.
- Commands to run the frontend locally.
- TypeScript, lint, and build results.
- Any known limitations.

The final result should be a cohesive, responsive, maintainable TaskFlow frontend that integrates with the existing Express backend and is ready for further testing and eventual AWS deployment.

Start by inspecting the repository, then implement the frontend. Do not ask me to recreate the project from scratch.
