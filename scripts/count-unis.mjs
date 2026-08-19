import fs from 'node:fs'
const t = fs.readFileSync('src/data/universities.ts', 'utf8')
const entries = [...t.matchAll(/\{ id: '([^']+)',[\s\S]*?state: '([^']+)'/g)]
const img = fs.readFileSync('src/data/campusImages.generated.ts', 'utf8')
const imaged = new Set([...img.matchAll(/'([^']+)': '/g)].map((m) => m[1]))
const byState = {}
for (const [, id, state] of entries) {
  byState[state] = (byState[state] || 0) + 1
}
console.log('total', entries.length)
console.log('with real image', entries.filter(([, id]) => imaged.has(id)).length)
console.log(byState)
