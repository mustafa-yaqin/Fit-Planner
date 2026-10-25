// Settings of the backend: port, size limits, folders (the website is read from ../frontend/dist).
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

export const PORT = Number(process.env.PORT) || 3001
export const MAX_BODY = 2 * 1024 * 1024
export const MAX_UPLOAD_BODY = 3 * 1024 * 1024
export const DIST = join(HERE, '..', 'frontend', 'dist') // the built website (npm run build)
export const UPLOADS = process.env.UPLOADS_DIR || join(HERE, 'uploads')
