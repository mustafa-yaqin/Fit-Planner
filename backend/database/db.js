// Very small "database": one JSON file (backend/data/db.json).
// Every change is written right away (to a temp file first, then renamed),
// so a crash can never leave a half-written file.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data')
const dataFile = process.env.DB_FILE || join(dataDir, 'db.json')

const empty = () => ({ users: [], sessions: [], planners: {}, messages: [], activities: null, uploads: {} })

function load() {
  mkdirSync(dirname(dataFile), { recursive: true })
  if (!existsSync(dataFile)) return empty()
  try {
    return { ...empty(), ...JSON.parse(readFileSync(dataFile, 'utf8')) }
  } catch {
    // damaged file: keep a copy and start fresh instead of crashing
    renameSync(dataFile, dataFile + '.broken-' + Date.now())
    return empty()
  }
}

export const db = load()

export function save() {
  const temp = dataFile + '.tmp'
  writeFileSync(temp, JSON.stringify(db))
  renameSync(temp, dataFile)
}
