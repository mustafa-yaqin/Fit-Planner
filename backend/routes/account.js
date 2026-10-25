// Sign up, log in, log out, "who am I".
import { db } from '../database/db.js'
import {
  COOKIE, SESSION_SECONDS, checkPassword, cookieHeader, createSession, destroySession,
  dummyHash, hashPassword, newUser, publicUser, readCookie,
} from '../auth/auth.js'
import { currentUser } from '../auth/guards.js'
import { checkLogin, checkRegister } from '../validators/validate.js'
import { HttpError, ip, readJson } from '../lib/http.js'
import { limited } from '../lib/rateLimit.js'

export const accountRoutes = {
  // Always answers 200 so the browser console stays clean for guests.
  'GET /api/auth/me': async (req) => {
    const user = currentUser(req)
    return { body: { user: user ? publicUser(user) : null } }
  },

  'POST /api/auth/register': async (req) => {
    if (limited('register:' + ip(req), 10, 3600000)) throw new HttpError(429, 'too_many')
    const input = checkRegister(await readJson(req))
    if (input.error) throw new HttpError(400, 'invalid_' + input.error)
    if (db.users.some((u) => u.email === input.email)) throw new HttpError(409, 'email_taken')
    const user = newUser(input.name, input.email, await hashPassword(input.password))
    const token = createSession(user.id)
    return { status: 201, body: { user: publicUser(user) }, headers: { 'Set-Cookie': cookieHeader(token, SESSION_SECONDS) } }
  },

  'POST /api/auth/login': async (req) => {
    const input = checkLogin(await readJson(req))
    if (input.error) throw new HttpError(401, 'bad_credentials')
    if (limited('login:' + ip(req), 20, 600000) || limited('login:' + input.email, 8, 600000)) {
      throw new HttpError(429, 'too_many')
    }
    const user = db.users.find((u) => u.email === input.email)
    const ok = await checkPassword(input.password, user ? user.passwordHash : dummyHash)
    if (!user || !ok) throw new HttpError(401, 'bad_credentials')
    const token = createSession(user.id)
    return { body: { user: publicUser(user) }, headers: { 'Set-Cookie': cookieHeader(token, SESSION_SECONDS) } }
  },

  'POST /api/auth/logout': async (req) => {
    const token = readCookie(req, COOKIE)
    if (token) destroySession(token)
    return { body: { ok: true }, headers: { 'Set-Cookie': cookieHeader('', 0) } }
  },
}
