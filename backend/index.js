// FitPlanner backend: plain Node.js, no packages to install.
// Run:  npm run server     (API on http://localhost:3001)
import { db, save } from './database/db.js'
import { seedActivities } from './database/seed.js'
import { PORT } from './config.js'
import { createApp } from './app.js'

// first start: the shared activity list begins with the sample activities
if (!db.activities) {
  db.activities = seedActivities
  save()
}

createApp().listen(PORT, () => console.log('FitPlanner API ready on http://localhost:' + PORT))
