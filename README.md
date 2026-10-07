# ConnectCulture

A MySpace-inspired social networking platform, built as a Replit export. The project guide in `replit.md` calls the app **SpaceLink**.

## Features

- **User profiles** — customizable profiles with themes, layouts, and custom CSS.
- **Posts** — create and view social posts with interactions.
- **Messaging** — real-time direct messaging over WebSockets with read receipts.
- **File sharing** — upload and share files (Multer multipart uploads to `uploads/`).
- **Connections** — follow/connect with other users.
- **Profile analytics** — profile view tracking.
- **Invite-only registration** — invite system for new accounts.
- **Authentication** — Replit Auth via OpenID Connect, PostgreSQL-backed sessions.

## Tech stack

- Frontend: React, TypeScript, Vite, Wouter (routing), TanStack Query, Tailwind CSS, shadcn/ui.
- Backend: Node.js, Express, TypeScript, WebSocket support, Multer.
- Database: PostgreSQL (Neon serverless driver) with Drizzle ORM; `shared/schema.ts` holds the schema (users, sessions, invites, connections, files, posts, messages).
- Auth: Replit Auth (OpenID Connect), `connect-pg-simple` sessions.

## Getting started

```bash
npm install
npm run db:push      # push the Drizzle schema to the database
npm run dev          # start (port 5000; see .replit)
```

Required environment: `DATABASE_URL` (Postgres connection string), `SESSION_SECRET`. The Replit environment used Node.js 20 and PostgreSQL 16.

## Project structure

```
├── client/     # React frontend (pages: landing, home, profile, messages, files,
│               # customize, civic, safety, privacy, health, apps)
├── server/     # Express backend (index.ts, routes.ts, storage.ts, db.ts,
│               # replitAuth.ts, vite.ts)
├── shared/     # Drizzle + Zod schemas shared by client and server
├── uploads/    # user-uploaded files
├── .replit     # Replit run config (npm run dev, port 5000)
└── replit.md   # full project guide (architecture, data flows, deployment)
```

## Status

**Working application.** Documented in `replit.md` as a complete full-stack app. Note that authentication depends on Replit Auth (OpenID), so running it outside Replit requires replacing or stubbing the auth flow. Exported from https://replit.com/@realjasontclark/ConnectCulture.
