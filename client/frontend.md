# TaskFlow – Complete Frontend Development

Act as a senior Next.js frontend engineer. Build a complete, modern, responsive frontend for my TaskFlow project.

## Tech Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- Existing Express + TypeScript backend
- MongoDB backend
- JWT authentication using HttpOnly cookies

## Project Structure
The repository contains:
- `client/` – Next.js frontend
- `server/` – Express backend

Work inside `client/`. First inspect the existing codebase, backend routes, API response format, authentication flow, and environment variables. Reuse existing code where appropriate. Do not overwrite working functionality unnecessarily.

## Required Features

### 1. Authentication
- Registration and login pages
- Logout functionality
- Persistent authentication using HttpOnly cookies
- Protected dashboard routes
- Current-user session checking
- Proper loading and error states

### 2. Project Management
- Projects dashboard
- Create, view, edit, and delete projects
- Project status: active, completed, archived
- Project details page

### 3. Sprint Management
- Create, view, edit, and delete sprints within projects
- Sprint goals, start dates, end dates, and statuses
- Sprint overview and progress

### 4. Task Management
- Create, view, edit, and delete tasks
- Assign tasks to projects and optional sprints
- Move tasks between sprints and backlog
- Task statuses: todo, in-progress, done
- Priorities: low, medium, high
- Due dates
- Filter tasks by status, priority, and sprint

### 5. UI/UX
- Professional SaaS-style dashboard
- Responsive desktop, tablet, and mobile layouts
- Sidebar navigation and clear page hierarchy
- Task board with three status columns
- Reusable components and consistent design system
- Confirmation dialogs for destructive actions
- Empty states, loading skeletons, toast notifications, and error messages
- Accessible forms and controls

## API Integration
Use the existing backend at:

`NEXT_PUBLIC_API_URL=http://localhost:5050/api`

Create or improve a centralized, strongly typed API client.

- Always use `credentials: "include"`.
- Follow the existing standardized API response format.
- Handle HTTP errors and API-level errors consistently.
- Never expose JWT secrets or private environment variables.
- Do not store authentication tokens in localStorage.
- Do not invent backend endpoints. Inspect the actual backend routes and adapt the frontend accordingly.

## Code Quality
- Use TypeScript strictly; avoid `any`.
- Use reusable components, hooks, and clean folder organization.
- Separate API logic from UI components.
- Validate forms.
- Prevent duplicate submissions.
- Handle unauthorized responses and expired sessions.
- Keep server and client components appropriately separated.
- Follow Next.js App Router best practices.

## Final Requirements
1. Implement all features end to end.
2. Ensure every button and form performs its intended action.
3. Verify navigation and API integration.
4. Run TypeScript checks and production build.
5. Fix all errors you introduce.
6. Provide a summary of files created/modified and any backend changes required.

**Important:** Do not just generate UI mockups. Build a fully functional frontend connected to my existing backend. Do not modify the backend unless absolutely necessary; report any missing API functionality instead.