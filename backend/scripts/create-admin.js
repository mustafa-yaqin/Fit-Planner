// Creates (or replaces) the ONE admin account.
// Run:  npm run create-admin
import { createInterface } from 'node:readline'
import { db, save } from '../database/db.js'
import { hashPassword, newUser } from '../auth/auth.js'

const rl = createInterface({ input: process.stdin, output: process.stdout })
let muted = false
const write = rl._writeToOutput
rl._writeToOutput = (text) => {
  if (!muted) write.call(rl, text)
  else if (text.includes('\n')) write.call(rl, '\n')
}

const ask = (question, hidden = false) =>
  new Promise((resolve) => {
    rl.question(question, (answer) => {
      muted = false
      resolve(answer.trim())
    })
    muted = hidden
  })

// Normal use: answer the questions. For scripts you can set
// ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD instead.
const fromEnv = process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
const email = (fromEnv ? process.env.ADMIN_EMAIL : await ask('Admin email: ')).toLowerCase()
const name = (fromEnv ? process.env.ADMIN_NAME : await ask('Admin name: ')) || 'Admin'
const password = fromEnv
  ? process.env.ADMIN_PASSWORD
  : await ask('Admin password (at least 10 characters, typing is hidden): ', true)
rl.close()

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('That email does not look right.')
  process.exit(1)
}
if (password.length < 10) {
  console.error('The password must have at least 10 characters.')
  process.exit(1)
}

const passwordHash = await hashPassword(password)
for (const user of db.users) if (user.role === 'admin') user.role = 'user' // only one admin
const existing = db.users.find((u) => u.email === email)
if (existing) {
  existing.role = 'admin'
  existing.name = name
  existing.passwordHash = passwordHash
  db.sessions = db.sessions.filter((s) => s.userId !== existing.id) // log out old sessions
} else {
  newUser(name, email, passwordHash, 'admin')
}
save()
console.log('Done. The admin account is ' + email)
