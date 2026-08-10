import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { NextRequest, NextResponse } from 'next/server'
import { devApiEnvFromProcess, handleDevApiRequest } from './devApi'

type CapturedResponse = {
  statusCode: number
  headers: Record<string, string | string[]>
  body: Buffer
}

function headersToNode(headers: Headers): IncomingMessage['headers'] {
  const out: Record<string, string | string[]> = {}
  headers.forEach((value, key) => {
    const existing = out[key]
    if (existing === undefined) {
      out[key] = value
    } else if (Array.isArray(existing)) {
      existing.push(value)
    } else {
      out[key] = [existing, value]
    }
  })
  return out
}

export async function handleNextApiRequest(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url)
  const pathWithQuery = `${url.pathname}${url.search}`
  const bodyBuf = Buffer.from(await req.arrayBuffer())

  const nodeReq = Readable.from(bodyBuf) as IncomingMessage
  nodeReq.method = req.method
  nodeReq.url = pathWithQuery
  nodeReq.headers = headersToNode(req.headers)

  const captured: CapturedResponse = {
    statusCode: 200,
    headers: {},
    body: Buffer.alloc(0),
  }

  const chunks: Buffer[] = []

  const nodeRes = {
    statusCode: 200,
    setHeader(name: string, value: string | number | readonly string[]) {
      captured.headers[name.toLowerCase()] = Array.isArray(value)
        ? [...value].map(String)
        : String(value)
    },
    getHeader(name: string) {
      return captured.headers[name.toLowerCase()]
    },
    end(chunk?: unknown) {
      if (chunk !== undefined && chunk !== null) {
        if (Buffer.isBuffer(chunk)) chunks.push(chunk)
        else if (typeof chunk === 'string') chunks.push(Buffer.from(chunk))
        else chunks.push(Buffer.from(String(chunk)))
      }
      captured.statusCode = nodeRes.statusCode
      captured.body = Buffer.concat(chunks)
      settle()
    },
  } as unknown as ServerResponse & { statusCode: number }

  let settle!: () => void
  const done = new Promise<void>((resolve) => {
    settle = resolve
  })

  const handled = handleDevApiRequest(nodeReq, nodeRes, devApiEnvFromProcess())
  if (!handled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await done

  const headers = new Headers()
  for (const [key, value] of Object.entries(captured.headers)) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v)
    } else {
      headers.set(key, value)
    }
  }

  return new NextResponse(new Uint8Array(captured.body), {
    status: captured.statusCode,
    headers,
  })
}
