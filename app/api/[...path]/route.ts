import { NextRequest } from 'next/server'
import { handleNextApiRequest } from '../../../server/nextApiAdapter'

type Ctx = { params: Promise<{ path: string[] }> }

async function handle(req: NextRequest, _ctx: Ctx) {
  return handleNextApiRequest(req)
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
