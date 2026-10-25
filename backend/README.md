# FitPlanner backend (Node.js)

Plain Node.js (version 18 or newer). **No packages to install.**
This folder is completely separate from the website (`../frontend`).
Everything the server needs is inside it.

## What is where
    backend/
      index.js            starts the server
      app.js              security headers, /api, /uploads, and the built website
      config.js           port, size limits, folders
      routes/             one file per feature (add a feature = add a file + one line in routes/index.js)
        account.js          sign up, log in, log out, who am I
        planner.js          the routine and own activities of the logged-in user (merge, never overwrite)
        activities.js       shared activity list (everybody reads, admin changes)
        userActivities.js   admin: see / edit / delete users' own activities
        upload.js           photo upload
        contact.js          contact messages
        admin.js            numbers, messages, users, backup
        health.js           GET /api/health
      auth/               passwords + login sessions (auth.js), who may do what (guards.js)
      database/           db.js (the JSON file) and seed.js (first sample activities)
      validators/         validate.js (checks everything that comes from the browser)
      lib/                http.js, router.js, rateLimit.js, static.js (helpers)
      scripts/            create-admin.js
      data/               db.json   (created automatically: your data!)
      uploads/            photos uploaded in the admin panel

If an error appears, the file name in the message tells you the feature.

## Commands (run them in this folder, or use the same names from the main folder)
    npm run create-admin    create / change the ONE admin account (first time)
    npm run dev             start with automatic restart  (same as: npm run server in the main folder)
    npm start               start normally

Behind HTTPS: `COOKIE_SECURE=1 npm start`. Another port (PowerShell): `$env:PORT=3002; npm start`.

## Changes never overwrite each other
- Saving the routine / own activities is a MERGE on the server, not "replace everything".
  An old open copy of the site, a second device or changes made offline can not wipe a newer change.
- Activities have a revision number (`rev`): an edit made on an older revision is rejected (409).
  Deleted items are remembered, so an old copy can not bring them back.
- Routine items carry the time of their last change; the newest change wins; removals are remembered.
- The website asks again when the internet returns, when the visitor comes back to the tab and every minute;
  if nothing changed the server answers `304` (almost no data).

## API (short)
Public: GET /api/activities, POST /api/contact, POST /api/auth/register|login|logout, GET /api/auth/me
Logged in: GET|PUT /api/planner
Admin only: /api/admin/activities, /api/admin/user-activities, /api/admin/upload,
/api/admin/messages, /api/admin/users, /api/admin/stats, /api/admin/backup

## Good to know
- One JSON file is fine for learning and a small site. For many users move `database/db.js` to a real database.
- Do not put `data/` or `uploads/` on GitHub (they are in .gitignore). Back them up.
