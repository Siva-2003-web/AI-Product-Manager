# Deployment Guide

![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-black?style=for-the-badge&logo=vercel&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=node.js&logoColor=white)

This project has two deployable parts:

- Root app: Vite + Express AI planning studio
- `landing/`: Next.js auth and landing app

## Table of Contents

- [Recommended Hosting Split](#recommended-hosting-split)
- [Architecture Diagram](#architecture-diagram)
- [Render Backend Deployment](#render-backend-deployment)
- [Vercel Frontend Deployment](#vercel-frontend-deployment)
- [Local Deployment Checks](#local-deployment-checks)
- [Common Failure Modes](#common-failure-modes)
- [Quick Checklist](#quick-checklist)
- [Notes](#notes)

## Recommended Hosting Split

- Render: deploy the root app
- Vercel: deploy the `landing/` app

This split matches the current codebase and avoids trying to run the Express backend on Vercel without refactoring.

## Architecture Diagram

![Architecture Diagram](docs/architecture.svg)

## 1) Render Backend Deployment

### What Render runs

Use the repository root as the service source.

Render settings:

- Build command: `NODE_OPTIONS=--max-old-space-size=3072 npm ci && NODE_OPTIONS=--max-old-space-size=3072 npm run build`
- Start command: `node dist/server.cjs`
- Health check path: `/api/health`

### Why this works

The root package now keeps install and build separate, so Render must install dependencies and then run `npm run build` to generate `dist/server.cjs` before startup.

### Required Render environment variables

Set these in the Render dashboard:

- `GEMINI_API_KEY`
- `NODE_ENV=production`
- `PORT` is provided by Render automatically

### Render Blueprint

The repo includes `render.yaml` with the recommended config. If you use Blueprint sync, make sure the service is pointing at the latest commit.

### Verify the backend

After deploy, confirm:

- Render logs show `npm ci` and the build completing successfully
- `node dist/server.cjs` starts without `MODULE_NOT_FOUND`
- `GET /api/health` returns an OK response

## 2) Vercel Frontend Deployment

Deploy only the `landing/` folder to Vercel.

### Vercel settings

- Root Directory: `landing`
- Framework: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`
- Output: use the default Next.js output

### Required Vercel environment variables

Set these in the Vercel dashboard if the landing app needs them:

- `MONGODB_URI` - use a full Atlas connection string, for example `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`
- `JWT_SECRET`
- `NEXT_PUBLIC_MAIN_APP_URL` - the Render URL for the root AI Product Manager app, for example `https://ai-product-manager.onrender.com`
- `NEXT_PUBLIC_API_URL` only if the browser frontend needs to call a separate backend URL directly

Do not set `MONGODB_URI` to a short label, project id, or cluster id. The host portion must resolve to your Atlas cluster.

### Verify the frontend

After deploy, confirm:

- Login and register pages load
- Auth requests succeed
- The frontend points to the correct backend URL if one is configured

## 3) Local Deployment Checks

Before pushing, verify locally:

```bash
npm install
npm run build
npm run start
```

For the landing app:

```bash
cd landing
npm install
npm run build
```

## 4) Common Failure Modes

### `Cannot find module dist/server.cjs`

This means the production build did not run before startup. Check that:

- Render is using the latest commit
- The build log shows both `npm ci` and `npm run build` completed successfully

### Out of memory during build

Increase Node heap size in the Render build step:

```bash
NODE_OPTIONS=--max-old-space-size=3072 npm ci
```

If needed, raise the value further.

### Auth or database failures

Make sure both are set separately:

- `MONGODB_URI`
- `JWT_SECRET`

Do not combine them into one variable.

## 5) Quick Checklist

- [ ] Root app builds locally
- [ ] Render has `GEMINI_API_KEY`
- [ ] Render deploy uses the latest commit
- [ ] `landing/` has `MONGODB_URI`
- [ ] `landing/` has `JWT_SECRET`
- [ ] Vercel points to `landing/`
- [ ] Health endpoint works after deploy

## 6) Notes

- The root server binds to `process.env.PORT` and `0.0.0.0`.
- The repo is a monorepo-style setup, so deployment targets should be split by app.
- Keep secrets in host dashboards, not in git.
