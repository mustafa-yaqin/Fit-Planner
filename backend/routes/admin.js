// Admin only: numbers, messages, users, backup.
import { db, save } from '../database/db.js'
import { publicUser } from '../auth/auth.js'
import { requireAdmin } from '../auth/guards.js'
import { HttpError } from '../lib/http.js'
import { removeUserPhotos } from './upload.js'

export const adminRoutes = {
  'GET /api/admin/stats': async (req) => {
    requireAdmin(req)
    return {
      body: {
        users: db.users.length,
        activities: db.activities.length,
        messages: db.messages.length,
        unread: db.messages.filter((m) => !m.read).length,
      },
    }
  },

  'GET /api/admin/messages': async (req) => {
    requireAdmin(req)
    return { body: { messages: [...db.messages].reverse() } }
  },

  'POST /api/admin/messages/:id/read': async (req, params) => {
    requireAdmin(req)
    const message = db.messages.find((m) => m.id === params.id)
    if (!message) throw new HttpError(404, 'not_found')
    message.read = true
    save()
    return { body: { ok: true } }
  },

  'DELETE /api/admin/messages/:id': async (req, params) => {
    requireAdmin(req)
    db.messages = db.messages.filter((m) => m.id !== params.id)
    save()
    return { body: { ok: true } }
  },

  'GET /api/admin/users': async (req) => {
    requireAdmin(req)
    return {
      body: {
        users: db.users.map((u) => ({ ...publicUser(u), createdAt: u.createdAt })),
      },
    }
  },

  'DELETE /api/admin/users/:id': async (req, params) => {
    const admin = requireAdmin(req)
    if (params.id === admin.id) throw new HttpError(400, 'cannot_delete_admin')
    db.users = db.users.filter((u) => u.id !== params.id)
    db.sessions = db.sessions.filter((s) => s.userId !== params.id)
    delete db.planners[params.id]
    removeUserPhotos(params.id, new Set(), 0)
    save()
    return { body: { ok: true } }
  },

  // A copy of all site data (without password hashes) to keep somewhere safe.
  'GET /api/admin/backup': async (req) => {
    requireAdmin(req)
    const backup = {
      exportedAt: new Date().toISOString(),
      users: db.users.map((u) => ({ ...publicUser(u), createdAt: u.createdAt })),
      activities: db.activities,
      messages: db.messages,
      planners: db.planners,
    }
    return {
      body: backup,
      headers: { 'Content-Disposition': 'attachment; filename="fitplanner-backup.json"' },
    }
  },
}
