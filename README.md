# ASTHRA Welcome Robot

Interactive welcome kiosk web app for **Asthra 11.0** (SJCET Palai), built with Next.js.

It combines:
- ID-card scanning flow with a scanner API
- Event discovery and QR-based registration links
- Visitor feedback collection
- Admin dashboard for analytics and contributor management
- Public “Meet the Makers” showcase

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Supabase (Database + Storage)

## Features

- **Home (`/`)**: animated landing with guided navigation
- **Scan (`/scan`)**: camera capture, ID image upload to scanner API, personalized greeting
- **Events (`/events`)**: searchable/filterable event explorer with per-event QR modal
- **Feedback (`/feedback`)**: 5-question rating flow stored in Supabase
- **Admin (`/admin`)**: password-gated panel for:
  - feedback analytics
  - contributor CRUD
  - contributor image uploads to Supabase Storage (`contributors` bucket)
- **Makers (`/makers`)**: public contributors showcase

## Prerequisites

- Node.js 20+
- npm
- Supabase project (for feedback/admin/makers data)
- Scanner backend API (for `/scan` flow)

## Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SCANNER_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_ADMIN_PASSWORD=change-this-password
```

### Notes

- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** and must never be exposed to the browser.
- `NEXT_PUBLIC_ADMIN_PASSWORD` defaults in code if unset; set this explicitly in production.
- If the scanner backend runs elsewhere, update `NEXT_PUBLIC_SCANNER_API_URL`.

## Supabase Setup

This app expects:

- A `feedbacks` table with columns:
  - `id`, `session_id`
  - `q1_overall_design`, `q2_ui_visual`, `q3_id_scanning`, `q4_event_registration`, `q5_overall_experience`
  - `user_agent`, `submitted_at`
- A `contributors` table with columns:
  - `id`, `name`, `department`, `year`, `role`, `image_url`, `created_at`
- A public storage bucket named `contributors`

The app auto-creates the `contributors` bucket when contributor images are uploaded from admin.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev    # start local dev server
npm run build  # production build
npm run start  # run production server
npm run lint   # run ESLint
```

## Project Structure

```text
app/
  admin/        # admin UI + server actions
  components/   # shared UI, robot voice/hud, effects
  events/       # events explorer
  feedback/     # feedback flow
  makers/       # public contributor showcase
  scan/         # ID scanning flow
lib/
  data.ts           # event data source
  feedbackActions.ts
  supabase.ts
  supabaseAdmin.ts
public/
  events/ staff/ fevicon/
```

## Scanner API Contract (used by `/scan`)

The scan flow expects a JSON response with:

- `success: boolean`
- `name: string | null`
- `message: string`
- `confidence: number`
- `processing_time_ms?: number`

## Deployment

Deploy as a standard Next.js app.

Before deploying, ensure all required environment variables are configured in your hosting platform.
