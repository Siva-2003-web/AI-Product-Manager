# Project Documentation

This document describes the AI Product Manager + Builder repository as a whole, including the two-app architecture, runtime behavior, configuration, and deployment flow.

## 1. Project Overview

AI Product Manager + Builder is a monorepo-style product planning platform with two deployable apps:

- Root app: a Vite + Express AI planning studio for generating product artifacts.
- `landing/` app: a Next.js auth and marketing experience for login, registration, and user entry.

The platform turns a raw product idea into a structured product package with planning outputs such as PRDs, user stories, roadmaps, database schemas, API specs, wireframes, and exported PDFs.

## 2. High-Level Architecture

The repo is intentionally split across two hosting targets:

- Render hosts the root backend and AI generation API.
- Vercel hosts the `landing/` Next.js app.
- MongoDB Atlas stores landing app authentication data.
- Google Gemini powers the planning generation flow.
- The browser stores generated project state locally for fast reuse and export.

See the standalone architecture image in [architecture.svg](architecture.svg).

## 3. Technology Stack

### Root app

- Vite 6
- React 19
- Express 4
- TypeScript 5
- esbuild for production server bundling
- Google Gemini API
- `jspdf` for PDF export
- `http-proxy-middleware` for local development routing

### Landing app

- Next.js 14 App Router
- React 18
- TypeScript 5
- MongoDB driver
- `bcryptjs` for password hashing
- `jose` for JWT signing and verification
- Framer Motion for UI animation

## 4. Repository Structure

```text
.
├── server.ts
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── utils/
│   └── types.ts
├── landing/
│   ├── app/
│   ├── components/
│   └── lib/
├── docs/
│   ├── architecture.svg
│   └── project-documentation.md
├── README.md
├── deployment.md
├── render.yaml
├── Dockerfile
└── .github/workflows/
```

## 5. Runtime Flow

### Root app flow

1. The user enters a product idea in the root app.
2. The Express server receives the request at `/api/generate`.
3. The server sends the prompt to Google Gemini.
4. Gemini returns structured planning output.
5. The UI renders the generated artifacts in tabs.
6. The user can export the result as a PDF.

### Landing app flow

1. The user opens the Vercel-hosted landing app.
2. Authentication pages call the landing app’s own API routes.
3. Those routes connect to MongoDB Atlas and issue JWT cookies.
4. Session checks use `/api/auth/me` and `/api/auth/logout`.
5. Authenticated users can proceed to the planning experience.

## 6. Main Features

- AI-assisted product planning from a single prompt.
- Artifact generation for PRDs, user stories, roadmaps, schemas, and API design.
- PDF export of generated planning materials.
- Landing page and auth system for user sign-in and registration.
- Local storage for draft project state and history.
- Polished animated UI with reusable theme presets.

## 7. Environment Variables

### Root app / Render

| Variable         | Required | Purpose                                     |
| ---------------- | -------- | ------------------------------------------- |
| `GEMINI_API_KEY` | Yes      | Gemini access key for AI generation         |
| `NODE_ENV`       | No       | Usually `production` in hosted environments |
| `PORT`           | No       | Provided by Render automatically            |

### Landing app / Vercel

| Variable      | Required | Purpose                         |
| ------------- | -------- | ------------------------------- |
| `MONGODB_URI` | Yes      | MongoDB Atlas connection string |
| `JWT_SECRET`  | Yes      | Secret used to sign auth tokens |

## 8. Local Setup

### Root app

```bash
npm install
npm run dev
```

### Landing app

```bash
cd landing
npm install
npm run dev
```

### Production check

```bash
npm run build
npm run start
```

## 9. Deployment Model

### Render backend

- Deploy the repository root to Render.
- Use the included `render.yaml` Blueprint when possible.
- The backend should start from `dist/server.cjs`.
- The health endpoint is `/api/health`.

### Vercel frontend

- Deploy only the `landing/` directory to Vercel.
- Keep the root directory set to `landing`.
- The auth app uses MongoDB and JWT secrets in Vercel environment settings.

## 10. API Reference

### Root app endpoints

- `GET /api/health` - health check and Gemini key status.
- `POST /api/generate` - generates planning artifacts.
- `POST /api/debug-pdf` - saves a PDF export for debugging in development.
- `GET /api/font/:fontName` - font proxy used by PDF generation.

### Landing app endpoints

- `POST /api/auth/register` - creates a user account.
- `POST /api/auth/login` - authenticates a user.
- `GET /api/auth/me` - returns the current session user.
- `POST /api/auth/logout` - clears the session cookie.

## 11. Auth and Data Handling

- Passwords are hashed before storage.
- JWTs are stored in secure HTTP-only cookies.
- MongoDB stores user records in the `users` collection.
- Email uniqueness is enforced by a unique index.
- The landing app expects a real MongoDB Atlas URI in production; it should not rely on localhost there.

## 12. Important Implementation Notes

- The root server binds to `0.0.0.0` and `process.env.PORT` for production hosts.
- The development proxy to the Next.js landing app is disabled in production.
- Generated project state is kept locally in the browser for quick restoration.
- The architecture diagram is maintained separately as an SVG asset for reuse in docs.

## 13. Troubleshooting

### Render cannot find `dist/server.cjs`

This means the production build did not run before start. Confirm the root install/build workflow and the current commit on Render.

### Auth register returns 500

Check that `MONGODB_URI` and `JWT_SECRET` are set in the Vercel environment for the landing app.

### Proxy error to `onrender.com`

This usually means the production server tried to forward requests to the local landing proxy target. Production should not proxy to `localhost:3001`.

### Build memory pressure

Use a larger Node heap during the Render install/build step if needed.

## 14. Maintenance Checklist

- Keep secrets in deployment dashboards, not in git.
- Update the architecture SVG when the hosting split changes.
- Recheck Render and Vercel settings after any auth or routing changes.
- Run the production build before pushing changes that affect startup.
