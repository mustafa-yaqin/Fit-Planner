# FitPlanner

Two completely separate folders:

    frontend/   the website (React + React Router + Tailwind)
    backend/    the server and the database (Node.js)   -> see backend/README.md

## Commands (run in THIS main folder)
First time:
    npm run setup           install the website packages (only the website needs them)
    npm run create-admin    make the ONE admin account

Every day, while you work (two terminals):
    npm run server          terminal 1: backend  (http://localhost:3001)
    npm run dev             terminal 2: website  (http://localhost:5173)

Final version, one server:
    npm run build
    npm start               open http://localhost:3001

## Where do I change something? (frontend/src)
| I want to change ...                    | open ...                                   |
|-----------------------------------------|--------------------------------------------|
| a text / sentence (Persian or English)  | locales/fa.js, locales/en.js (search the text) |
| the menu                                 | layout/Header/                             |
| the footer                               | layout/Footer/                             |
| the colors                               | ../tailwind.config.js                      |
| a Home section                           | pages/Home/<Section>/ (each has its own folder and photos) |
| the Routine page (summary, table, reset) | pages/Routine/ (Summary/, Table/, ResetButton/) |
| the list of activities / filters         | pages/Activities/                          |
| one activity page                        | pages/ActivityDetails/                     |
| the admin panel                          | pages/Admin/ (Manage/, Messages/, Users/, UserActivities/) |
| login / sign up                          | pages/Auth/                                |
| contact page and form                    | pages/Contact/                             |
| a photo                                  | the `images/` folder next to that section (same file name, .jpg) |
| saving / syncing with the server         | context/planner/ and offline/              |

Every file starts with one line that says what it does.

## Weak internet
Data is kept on the device first (localStorage) and sent to the database later; photos are
cached after the first visit; the site shows a message when the internet is off or slow.

## Putting the website on Vercel
1. In Vercel > Project > Settings > General: **Root Directory = `frontend`**. Build command `npm run build`, output `dist`.
2. The backend is NOT part of Vercel. On `*.vercel.app` the website switches itself to **website-only mode**:
   no calls to `/api` (clean console), no login / sign up / admin buttons, the routine is kept on the visitor's
   device, and `/login` shows a short "accounts are not online yet" page. (You can force it with the
   environment variable `VITE_API_MODE` = `off`, or force it on with `on`.)
3. When the backend is online (any Node host), put these two lines at the TOP of `rewrites` in
   `frontend/vercel.json`, set `VITE_API_MODE` = `on`, and start the backend with
   `COOKIE_SECURE=1 ALLOWED_ORIGINS=https://YOUR-SITE.vercel.app npm start`:

       { "source": "/api/:path*", "destination": "https://YOUR-BACKEND/api/:path*" },
       { "source": "/uploads/:path*", "destination": "https://YOUR-BACKEND/uploads/:path*" },

`frontend/vercel.json` also sets the security headers (CSP, X-Frame-Options, COOP ...) and the
page fallback for /routine, /admin ... after a reload.

## Speed (PageSpeed) notes
- The CSS is put inside index.html at build time (no blocking file); fonts are only the needed letters/weights.
- Pexels photos are loaded in several sizes (srcset): phones download small files.
- The admin panel is a separate download (only when /admin is opened).
- Your own photos: use .webp or .jpg about 100-150 KB (1200 px wide is enough).
