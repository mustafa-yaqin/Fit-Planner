// Passwords and login sessions.
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { db, save } from '../database/db.js'

const scryptAsync = promisify(scrypt)
const SESSION_DAYS = 30
export const COOKIE = 'fp_session'

export async function hashPassword(password) {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, 64)
  return salt.toString('hex') + ':' + key.toString('hex')
}

export async function checkPassword(password, stored) {
  const [saltHex, keyHex] = stored.split(':')
  const key = await scryptAsync(password, Buffer.from(saltHex, 'hex'), 64)
  const known = Buffer.from(keyHex, 'hex')
  return key.length === known.length && timingSafeEqual(key, known)
}

// Used when the email does not exist, so a wrong email and a wrong password
// take the same time and look the same to an attacker.
export const dummyHash = await hashPassword('not-a-real-password')

const sha = (text) => createHash('sha256').update(text).digest('hex')

export function createSession(userId) {
  const token = randomBytes(32).toString('base64url')
  const now = Date.now()
  db.sessions = db.sessions.filter((s) => s.expiresAt > now) // clean old ones
  db.sessions.push({ hash: sha(token), userId, expiresAt: now + SESSION_DAYS * 86400000 })
  save()
  return token
}

export function destroySession(token) {
  const hash = sha(token)
  db.sessions = db.sessions.filter((s) => s.hash !== hash)
  save()
}

export function userFromToken(token) {
  if (!token) return null
  const hash = sha(token)
  const session = db.sessions.find((s) => s.hash === hash && s.expiresAt > Date.now())
  return session ? db.users.find((u) => u.id === session.userId) || null : null
}

export function newUser(name, email, passwordHash, role = 'user') {
  const user = { id: randomUUID(), name, email, passwordHash, role, createdAt: new Date().toISOString() }
  db.users.push(user)
  save()
  return user
}

export const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role || 'user' })

export function cookieHeader(token, maxAgeSeconds) {
  const secure = process.env.COOKIE_SECURE === '1' ? '; Secure' : ''
  return COOKIE + '=' + token + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + maxAgeSeconds + secure
}

export function readCookie(req, name) {
  const header = req.headers.cookie || ''
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return ''
}

export const SESSION_SECONDS = SESSION_DAYS * 86400
