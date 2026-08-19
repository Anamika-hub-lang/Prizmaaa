import type { ReactNode } from 'react'

type Props = {
  content: string
}

export function AiResultMarkdown({ content }: Props) {
  const blocks = content.split(/\n(?=## )/)

  return (
    <div className="space-y-5 text-sm text-gray-700 leading-relaxed text-left">
      {blocks.map((block) => {
        const lines = block.trim().split('\n')
        const heading = lines[0]?.startsWith('## ') ? lines[0].replace(/^## /, '') : null
        const body = heading ? lines.slice(1).join('\n').trim() : block.trim()

        if (heading) {
          return (
            <section key={heading}>
              <h3 className="font-display text-base text-[#1a1a1a] mb-2">{heading}</h3>
              <div className="space-y-1.5 whitespace-pre-wrap">{formatBody(body)}</div>
            </section>
          )
        }

        return (
          <div key={block.slice(0, 40)} className="whitespace-pre-wrap">
            {formatBody(body)}
          </div>
        )
      })}
    </div>
  )
}

function formatBody(body: string): ReactNode[] {
  return body.split('\n').map((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return <br key={`br-${i}`} />
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <p key={i} className="flex gap-2 pl-1">
          <span className="text-indigo-500 shrink-0">•</span>
          <span>{trimmed.replace(/^[-*]\s+/, '')}</span>
        </p>
      )
    }
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <p key={i} className="pl-1">
          {trimmed}
        </p>
      )
    }
    return <p key={i}>{trimmed}</p>
  })
}
