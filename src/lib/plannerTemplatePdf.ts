import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { TeachingPlanTier } from './classTeachingPlanApi'

const tierCopy: Record<TeachingPlanTier, { label: string; fileSlug: string; rows: number }> = {
  monthly: { label: '1 Month planner', fileSlug: '1-month', rows: 16 },
  'three-month': { label: '3 Month planner', fileSlug: '3-month', rows: 20 },
  'six-month': { label: '6 Month planner', fileSlug: '6-month', rows: 24 },
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars) {
      if (current) lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}

export async function downloadPlannerTemplatePdf(input: {
  tier: TeachingPlanTier
  classTitle?: string
}): Promise<void> {
  const meta = tierCopy[input.tier]
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const orange = rgb(0.91, 0.35, 0.13)
  const ink = rgb(0.11, 0.11, 0.11)
  const muted = rgb(0.38, 0.38, 0.38)
  const line = rgb(0.88, 0.88, 0.88)

  const pageWidth = 612
  const pageHeight = 792
  const margin = 48
  const titleWidth = 250

  let page = doc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  const drawHeader = () => {
    page.drawText('PRIZMA', {
      x: margin,
      y,
      size: 18,
      font: bold,
      color: orange,
    })
    y -= 22
    page.drawText(`${meta.label} — topic worksheet`, {
      x: margin,
      y,
      size: 13,
      font: bold,
      color: ink,
    })
    y -= 18
    const classTitle = input.classTitle?.trim()
    if (classTitle) {
      page.drawText(`Class: ${classTitle}`.slice(0, 90), {
        x: margin,
        y,
        size: 11,
        font,
        color: ink,
      })
      y -= 16
    }
    const note =
      'List each topic below. Optional description helps students. Then enter the same topics in the class form (description and logo are optional).'
    for (const noteLine of wrapText(note, 92)) {
      page.drawText(noteLine, { x: margin, y, size: 9, font, color: muted })
      y -= 12
    }
    y -= 8
    page.drawText('#', { x: margin, y, size: 9, font: bold, color: muted })
    page.drawText('Topic', { x: margin + 28, y, size: 9, font: bold, color: muted })
    page.drawText('Optional description', {
      x: margin + 28 + titleWidth + 16,
      y,
      size: 9,
      font: bold,
      color: muted,
    })
    y -= 6
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1,
      color: orange,
    })
    y -= 18
  }

  drawHeader()

  const rowHeight = 28
  for (let i = 0; i < meta.rows; i++) {
    if (y < margin + rowHeight) {
      page = doc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
      drawHeader()
    }
    page.drawText(String(i + 1), {
      x: margin,
      y: y - 2,
      size: 9,
      font,
      color: muted,
    })
    page.drawLine({
      start: { x: margin + 28, y: y - 8 },
      end: { x: margin + 28 + titleWidth, y: y - 8 },
      thickness: 0.6,
      color: line,
    })
    page.drawLine({
      start: { x: margin + 28 + titleWidth + 16, y: y - 8 },
      end: { x: pageWidth - margin, y: y - 8 },
      thickness: 0.6,
      color: line,
    })
    y -= rowHeight
  }

  const bytes = await doc.save()
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `prizma-${meta.fileSlug}-planner-template.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
