import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  devApiEnvFromProcess,
  handleDevApiRequest,
} from '../vite/plugins/devApi.js'

function apiPathFromRequest(req: VercelRequest): string {
  const segments = req.query.path
  const joined = Array.isArray(segments) ? segments.join('/') : (segments ?? '')
  const rawUrl = req.url ?? '/'
  const search = rawUrl.includes('?') ? rawUrl.slice(rawUrl.indexOf('?')) : ''
  return `/api/${joined}${search}`
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  req.url = apiPathFromRequest(req)

  const handled = handleDevApiRequest(req, res, devApiEnvFromProcess())
  if (!handled) {
    res.status(404).json({ error: 'Not found' })
  }
}
