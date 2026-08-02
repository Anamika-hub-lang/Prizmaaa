import type { IncomingMessage, ServerResponse } from 'node:http'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { devApiEnvFromProcess, handleDevApiRequest } from '../vite/plugins/devApi.js'

export function createDevApiHandler(apiPath: string) {
  return function handler(req: VercelRequest, res: VercelResponse) {
    const raw = req.url ?? ''
    const search = raw.includes('?') ? raw.slice(raw.indexOf('?')) : ''
    req.url = `${apiPath}${search}`

    const handled = handleDevApiRequest(
      req as IncomingMessage,
      res as ServerResponse,
      devApiEnvFromProcess(),
    )
    if (!handled) {
      res.status(404).json({ error: 'Not found' })
    }
  }
}
