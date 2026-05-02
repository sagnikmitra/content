# Markex by ZS

A lightweight, mobile-first planner to align **content**, **marketing**, and **admin** teams on _what to post, when, and with which assets_. Think “Google Calendar for social posts,” built in-house to keep timelines, copy, and media in one place.

## Core Features

- **Timeline scheduling**: Create calendar entries with title, rich text, and publish time.
- **Rich content editor**: Draft copy for different channels; attach notes and variants.
- **Media workflow**: Upload and link assets stored in **Google Drive**; teammates can download the final files for posting.
- **Team visibility**: Daily view to see “what’s scheduled today” at a glance.
- **Responsive UI**: Works cleanly on mobile for on-the-go posting.********

## Tech Stack

- **Frontend**: React + Vite (fast HMR, modern tooling).
- **Language**: JavaScript (primary).
- **Build/Deploy**: Vite; Vercel config present in repo.
- **Integrations**: Google Drive API for media storage and retrieval.

## Structure

```
client/
├─ src/
│ ├─ components/ # UI building blocks (forms, editor, calendar/timeline)
│ ├─ pages/ # Views (Today, Timeline, Admin)
│ ├─ hooks/ # Data + UI hooks (e.g., useDriveAssets, useSchedule)
│ ├─ services/ # API clients (Google Drive, backend endpoints)
│ └─ styles/ # Global + modular styles
│
server/
├─ routes/ # REST endpoints for schedules, assets, users
├─ services/ # Google Drive service, auth helpers
└─ lib/ # Utilities (validation, date/time)
```

## Key Use Cases

- Content lead drafts posts with assets → schedules them on the timeline.
- Marketer opens **Today** view on mobile → downloads media from Drive → posts.
- Admin configures calendars, categories, and review status.

## Getting Started

```bash
# 1) Install
npm i

# 2) Dev
npm run dev

# 3) Build
npm run build && npm run preview
```

## Supabase Setup (Markex)

Use Supabase instead of MongoDB.

1. Create a Supabase project named `Markex`.
2. Open SQL Editor and run:
   - `server/supabase/schema.sql`
3. Create a Storage bucket named `content-assets` (or set your own bucket name in env vars below).
4. Optional Google Drive primary storage (recommended):
   - `GOOGLE_DRIVE_ENABLED` (optional, set `false` to force Supabase uploads)
   - `GOOGLE_DRIVE_FOLDER_ID`
   - `GOOGLE_DRIVE_CLIENT_EMAIL`
   - `GOOGLE_DRIVE_PRIVATE_KEY` (preserve line breaks; escaped `\n` supported)
   - Or single JSON var: `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON`
5. Storage behavior:
   - If Google Drive env vars exist, uploads go to Drive and download links are generated from Drive IDs.
   - If missing, system falls back to Supabase Storage bucket.
6. In your runtime environment (local or Vercel), set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET` (optional, defaults to `content-assets`)
   - `ADMIN_USERNAME` (optional, defaults to `admin`)
   - `ADMIN_PASSWORD` (optional, defaults to `Admin@123`)
   - `ADMIN_EMAIL` (optional, defaults to `admin@adm.in`)

The backend auto-bootstraps/synchronizes the admin account at startup.

## Vercel Deployment

This repo is configured for a single Vercel project:

- Frontend (Vite) serves static app from `dist`
- Backend (Express) runs from `server/index.js`
- API routes proxied on same domain:
  - `/auth/*`
  - `/content/*`

Set these Vercel environment variables before deploying:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET` (optional, defaults to `content-assets`)
- `GOOGLE_DRIVE_FOLDER_ID` (optional, enables Drive uploads when set with creds)
- `GOOGLE_DRIVE_CLIENT_EMAIL` (optional)
- `GOOGLE_DRIVE_PRIVATE_KEY` (optional)
- `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON` (optional alternative to email/key)
- `JWT_SECRET`
- `JWT_EXPIRY` (optional)
- `ADMIN_USERNAME` (optional, defaults to `admin`)
- `ADMIN_PASSWORD` (optional, defaults to `Admin@123`)
- `ADMIN_EMAIL` (optional, defaults to `admin@adm.in`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_STORAGE_BUCKET` (optional, defaults to `content-assets`)
- `VITE_ADMIN_EMAIL` (optional, defaults to `admin@adm.in`)
- `VITE_API_BASE_URL` (optional, set when frontend and backend are on different domains)

### Local Dev (no backend URL env needed)

- Start backend on `http://localhost:5050` (from `server/`)
- Start frontend with `npm run dev` (repo root)
- Vite proxies `/auth` and `/content` to backend automatically
- Optional override: set `VITE_DEV_API_URL` (e.g. `http://localhost:6000`)
