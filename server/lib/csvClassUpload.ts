export type ClassCsvRow = {
  id: string
  title: string
  category_id: 'skills' | 'academic' | 'professional'
  image: string
  mentor: string
  mentor_image: string
  duration: string
  sessions: string
  description: string
  price: number
  meet_link: string
  next_session_label: string
  published: boolean
}

const REQUIRED_HEADERS = [
  'id',
  'title',
  'category_id',
  'mentor',
  'duration',
  'sessions',
  'description',
  'price',
] as const

const VALID_CATEGORIES = new Set(['skills', 'academic', 'professional'])

function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  cells.push(current.trim())
  return cells
}

export function parseClassCsv(text: string): { rows: ClassCsvRow[]; error?: string } {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return { rows: [], error: 'CSV must include a header row and at least one data row.' }
  }

  const headers = splitCsvLine(lines[0]!).map((h) => h.toLowerCase())
  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      return { rows: [], error: `Missing required column: ${required}` }
    }
  }

  const idx = (name: string) => headers.indexOf(name)
  const rows: ClassCsvRow[] = []

  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i]!)
    const get = (name: string) => (idx(name) >= 0 ? (cells[idx(name)] ?? '').trim() : '')

    const id = get('id')
    const title = get('title')
    const category_id = get('category_id')
    const mentor = get('mentor')
    const duration = get('duration')
    const sessions = get('sessions')
    const description = get('description')
    const priceRaw = get('price')
    const price = Number(priceRaw)

    if (!id || !title) {
      return { rows: [], error: `Row ${i + 1}: id and title are required.` }
    }
    if (!VALID_CATEGORIES.has(category_id)) {
      return {
        rows: [],
        error: `Row ${i + 1}: category_id must be skills, academic, or professional.`,
      }
    }
    if (!Number.isFinite(price) || price < 0) {
      return { rows: [], error: `Row ${i + 1}: price must be a non-negative number.` }
    }

    const publishedRaw = get('published').toLowerCase()
    const published = publishedRaw === '' || publishedRaw === 'true' || publishedRaw === '1' || publishedRaw === 'yes'

    rows.push({
      id,
      title,
      category_id: category_id as ClassCsvRow['category_id'],
      image: get('image') || '',
      mentor,
      mentor_image: get('mentor_image') || '',
      duration,
      sessions,
      description,
      price: Math.round(price),
      meet_link: get('meet_link') || 'https://meet.google.com/',
      next_session_label: get('next_session_label') || 'Set schedule in Meet tab',
      published,
    })
  }

  return { rows }
}

export const CLASS_CSV_TEMPLATE_HINT =
  'id,title,category_id,mentor,duration,sessions,description,price,image,mentor_image,meet_link,next_session_label,published'
