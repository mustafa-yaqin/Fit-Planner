// Who is making the request? requireUser = must be logged in, requireAdmin = must be the admin.
import { COOKIE, readCookie, userFromToken } from './auth.js'
import { HttpError } from '../lib/http.js'

export const currentUser = (req) => userFromToken(readCookie(req, COOKIE))

export function requireUser(req) {
  const user = currentUser(req)
  if (!user) throw new HttpError(401, 'login_required')
  return user
}

// Only the single admin account may use the /api/admin/... routes.
export function requireAdmin(req) {
  const user = requireUser(req)
  if (user.role !== 'admin') throw new HttpError(403, 'admin_only')
  return user
}
