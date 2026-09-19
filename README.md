# Setu — AI-Verified Student Skills & Placement Portal

Full frontend for the Smart India Hackathon placement portal: sign up, log in, build a verified
student profile, and let recruiters search and open verified candidate resumes.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- JWT stored in `localStorage` (demo-only auth — swap for httpOnly cookies in production)
- Talks to a FastAPI backend at `http://127.0.0.1:8000`

## How to run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

The backend must be running at `http://127.0.0.1:8000` (see `lib/api.ts` for the `BASE_URL`,
and every endpoint it calls).

## Flows implemented

- **Auth**: sign up → verify email → log in → forgot/reset password
- **Student**: dashboard, profile, printable resume, uploads (documents, skills, projects),
  external profiles (GitHub / LinkedIn / LeetCode) with verification
- **Recruiter**: dashboard, candidate search (falls back to demo data if the backend returns
  nothing), candidate resume view

## Project structure

```
app/
  layout.tsx, page.tsx (landing)
  login/, signup/, verify-email/, forgot-password/, reset-password/
  student/dashboard/, student/profile/, student/resume/, student/uploads/, student/external/
  recruiter/dashboard/, recruiter/search/, recruiter/candidate/[id]/
components/
  Navbar.tsx, Sidebar.tsx, ResumeDocument.tsx
  ui/Button.tsx, ui/Input.tsx, ui/Card.tsx, ui/Label.tsx, ui/VerificationBadge.tsx
lib/
  api.ts   — typed fetch wrapper for every backend endpoint
  auth.ts  — localStorage token/user helpers
```

## Notes

- Route protection is done client-side: pages check `getAuth()` on mount and redirect to
  `/login` if there's no token or the role doesn't match.
- The recruiter candidate view and search results fall back to realistic dummy data when the
  backend endpoint returns nothing, since `/api/recruiter/search` is a stub for now.
- The resume page has a "Print / download PDF" button that calls `window.print()`; print
  styles hide the nav and sidebar automatically.
