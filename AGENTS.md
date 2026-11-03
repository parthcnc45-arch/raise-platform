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

