# Project Guidelines & AI Rules for Raise Platform

## 1. Monorepo Architecture & Package Isolation (STRICT RULE)

This repository is structured as a decoupled monorepo containing two independent services:
- `/frontend` — Next.js Application (client-side & UI)
- `/backend` — Express.js + Supabase API Application (server-side)

### ⚠️ STRICT PROHIBITIONS:
1. **NEVER install packages or dependencies in the root directory (`/`).**
2. **NEVER run `npm install <package>` directly in the root directory.**
3. **NEVER add packages to root `package.json`.**
   - The root `package.json` is strictly an orchestrator for local convenience scripts (e.g., `dev:frontend`, `dev:backend`). It must NOT contain runtime dependencies.

---

### ✅ MANDATORY PACKAGE INSTALLATION PROCEDURES:

#### If installing a package for FRONTEND:
- Always execute inside the `frontend/` directory:
  ```bash
  cd frontend
  npm install <package-name>
  ```
  *(or `npm --prefix frontend install <package-name>`)*
- All frontend packages must be strictly registered inside `frontend/package.json`.

#### If installing a package for BACKEND:
- Always execute inside the `backend/` directory:
  ```bash
  cd backend
  npm install <package-name>
  ```
  *(or `npm --prefix backend install <package-name>`)*
- All backend packages must be strictly registered inside `backend/package.json`.

---

## 2. Independent Deployment Requirement
Both `frontend` and `backend` are designed to be deployed completely independently to separate cloud platforms (e.g., Vercel for frontend, Render/Railway for backend):
- Do NOT introduce local relative file links like `"file:.."` across frontend and backend `package.json`.
- All database operations in backend use Supabase Cloud (`@supabase/supabase-js`).
- Frontend communicates with backend via REST API (`NEXT_PUBLIC_API_URL`).
- Backend controls access via CORS using `FRONTEND_URL`.

---

## 3. Git Commit & Push Policy (STRICT RULE)
- **NEVER run `git commit` or `git push` automatically after completing tasks.**
- Always keep changes local and show them to the user for review.
- Only execute `git commit` or `git push` when the user explicitly instructs to do so (e.g. "commit the changes", "push to github", etc.).

---

## 4. Supabase Security & Service Role Key Policy (CRITICAL RULE)
- **NEVER use or expose `SUPABASE_SERVICE_ROLE_KEY` in the Frontend (`/frontend`).**
- The `service_role` key has full administrator rights and bypasses Row Level Security (RLS). Putting it in frontend code or in `NEXT_PUBLIC_*` environment variables exposes full database access to the public.
- The Frontend must strictly communicate with the Backend API via `NEXT_PUBLIC_API_URL` (`apiClient`).
- All Supabase SDK calls using `SUPABASE_SERVICE_ROLE_KEY` must exclusively live within the `/backend` service.

---

## 5. Strict English Language Policy (STRICT RULE)
- **All code files, configuration files, comments, and project documentation must be strictly written in English.**
- NEVER use Gujarati or any other regional languages in project files, code, comments, commit messages, or markdown documents.
- Keep all internal code comments, variable names, and documentation exclusively in clear English.


