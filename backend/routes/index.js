// The list of ALL routes: one line per file in this folder. To add a feature, add a file and one line here.
import { healthRoutes } from './health.js'
import { accountRoutes } from './account.js'
import { plannerRoutes } from './planner.js'
import { activityRoutes } from './activities.js'
import { uploadRoutes } from './upload.js'
import { contactRoutes } from './contact.js'
import { adminRoutes } from './admin.js'
import { userActivityRoutes } from './userActivities.js'

export const routes = {
  ...healthRoutes,
  ...accountRoutes,
  ...plannerRoutes,
  ...activityRoutes,
  ...uploadRoutes,
  ...contactRoutes,
  ...adminRoutes,
  ...userActivityRoutes,
}
