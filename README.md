This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# pmrt-admin-panel

## Profile sync (Expo → API → Supabase)

1. Run `supabase/profiles.sql` in the Supabase SQL Editor.
2. Run `supabase/courses.sql` for All Courses in the mobile app.
3. Run `supabase/storage.sql` for image/video uploads in the admin UI.
3. Copy `.env.example` → add `SUPABASE_SERVICE_ROLE_KEY` on Vercel (and `.env.local` for local dev).
4. Redeploy. Expo uses:
   - `POST /api/sync-profile` after login
   - `GET /api/courses` and `GET /api/courses/:id` for course screens

## Admin UI

Open `/admin` after `npm run dev`:

- **Dashboard** — overview
- **Courses** — list, create, edit, lessons (video/material URLs)
- Toggle **Published** so the mobile app shows a course
