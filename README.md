# AI Product Manager + Builder

![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-black?style=for-the-badge&logo=vercel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-landing%20app-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

Turn raw product ideas into a production-ready plan in minutes.

This repo contains two connected apps:

- The root app: a Vite + Express AI planning studio that generates product artifacts with Gemini.
- The `landing/` app: a Next.js auth and marketing experience that powers login, registration, and the user-facing entry flow.

## Table of Contents

- [What It Does](#what-it-does)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [Useful Scripts](#useful-scripts)
- [API Overview](#api-overview)
- [Notes](#notes)
- [Troubleshooting](#troubleshooting)

## Architecture Diagram

![Architecture Diagram](docs/architecture.svg)

## What It Does

The platform takes a simple product idea and generates a structured product package, including:

- Product overview
- PRD / product specification
- User stories and sprint backlog
- Database schema suggestions
- UI wireframes
- API specification
- Development roadmap
- PDF export of all generated artifacts

It also supports:

- User authentication
- Project history saved in the browser
- Theme presets for different product styles
- Shareable project state via encoded links

## Architecture

| Area        | Stack                            | Purpose                                                   |
| ----------- | -------------------------------- | --------------------------------------------------------- |
| Root app    | Vite, React, Express, TypeScript | AI generation, artifact rendering, PDF export, server API |
| Landing app | Next.js, React, MongoDB, JWT     | Login, register, session auth, user-facing landing flow   |
| AI          | Google Gemini                    | Generates product planning content                        |
| Database    | MongoDB Atlas                    | Stores landing app user data                              |

## Features

- AI-powered planning workflow from a single product idea
- Modular artifact tabs for different planning stages
- Reusable themes and visual presets
- Export all artifacts as a combined PDF
- Authenticated access to the planning workspace
- Responsive UI with motion-enhanced interactions
- Local history for recently generated projects

## Project Structure

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
├── render.yaml
├── Dockerfile
└── .github/workflows/
```

## Requirements

- Node.js 24+
- npm 10+
- A Google Gemini API key
- A MongoDB Atlas connection string
- A JWT secret for authentication

## Environment Variables

### Root app / Render backend

| Variable                 | Required | Description                                                         |
| ------------------------ | -------- | ------------------------------------------------------------------- |
| `GEMINI_API_KEY`         | Yes      | Gemini access key used by the planning API                          |
| `PORT`                   | No       | Port used by the Express server; Render provides this automatically |
| `NODE_ENV`               | No       | Usually set to `production` on deploy                               |
| `VITE_LANDING_LOGIN_URL` | No       | Full landing app login URL used after logout in the root app        |

### Landing app / Next.js auth app

| Variable              | Required | Description                                                                        |
| --------------------- | -------- | ---------------------------------------------------------------------------------- |
| `MONGODB_URI`         | Yes      | MongoDB Atlas connection string                                                    |
| `JWT_SECRET`          | Yes      | Secret used to sign auth tokens                                                    |
| `NEXT_PUBLIC_API_URL` | No       | Only needed if the frontend calls a separate backend URL directly from the browser |

## Local Setup

### 1) Install dependencies

```bash
npm install
cd landing
npm install
cd ..
```

### 2) Add environment files

Create a root `.env` file for the Express/Gemini app and a `landing/.env.local` file for the Next.js app.

Example root `.env`:

```env
GEMINI_API_KEY=your_gemini_key
```

Example `landing/.env.local`:

```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_long_random_secret
```

### 3) Run the full stack locally

```bash
npm run dev
```

This starts:

- the root Express/Vite app
- the `landing/` Next.js app on port `3001`

### 4) Build for production

```bash
npm run build
```

### 5) Start the production server

```bash
npm run start
```

## Deployment

### Render backend

The repo includes a `render.yaml` Blueprint that defines the production build and start flow for the root app.

Important settings:

- Build: installs dependencies and builds the app with higher Node heap
- Start: runs `node dist/server.cjs`
- Health check: `/api/health`

### Vercel frontend

Deploy the `landing/` folder to Vercel as the frontend app.

Recommended Vercel settings:

- Root Directory: `landing`
- Build Command: `npm run build`
- Output: default Next.js output

## Useful Scripts

| Command         | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `npm run dev`   | Starts the root app and the Next.js landing app together           |
| `npm run build` | Builds the root app and bundles `server.ts` into `dist/server.cjs` |
| `npm run start` | Starts the production server from `dist/server.cjs`                |
| `npm run lint`  | Runs TypeScript type checking                                      |

## API Overview

- `GET /api/health` - health check and API key status
- `POST /api/generate` - generates planning artifacts from a product idea
- `POST /api/debug-pdf` - saves a PDF debug artifact in development
- `GET /api/font/:fontName` - font proxy used by PDF export

## Notes

- The root app requires `npm run build` after dependency installation to produce `dist/server.cjs` for production hosts like Render.
- The production server binds to `process.env.PORT` and `0.0.0.0`, which is required for Render.
- The landing app uses MongoDB and JWT auth; those secrets should stay in the hosting dashboard, not in git.

## Troubleshooting

- If Render says `Cannot find module dist/server.cjs`, make sure the build step completed successfully and the service is using the latest commit.
- If the build runs out of memory, increase Node heap with `NODE_OPTIONS=--max-old-space-size=3072` or higher.
- If login fails, check that `MONGODB_URI` and `JWT_SECRET` are both set in the `landing` deployment.

## License

No license file is currently included.
