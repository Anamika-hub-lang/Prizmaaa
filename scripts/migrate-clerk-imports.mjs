import fs from 'node:fs'
import path from 'node:path'

function walk(d, acc = []) {
  if (!fs.existsSync(d)) return acc
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p, acc)
    else if (/\.(tsx|ts)$/.test(e.name)) acc.push(p)
  }
  return acc
}

const files = [...walk('src'), ...walk('app')]
let n = 0
for (const f of files) {
  let s = fs.readFileSync(f, 'utf8')
  if (!s.includes('@clerk/clerk-react')) continue

  // Split SignedIn/SignedOut imports to local helpers when present
  const importRe =
    /import\s*\{([^}]+)\}\s*from\s*['"]@clerk\/clerk-react['"]/g
  s = s.replace(importRe, (_m, names) => {
    const parts = names.split(',').map((x) => x.trim()).filter(Boolean)
    const local = []
    const next = []
    for (const p of parts) {
      const name = p.split(/\s+as\s+/).pop().trim()
      if (name === 'SignedIn' || name === 'SignedOut') local.push(name)
      else next.push(p)
    }
    const lines = []
    if (next.length) lines.push(`import { ${next.join(', ')} } from '@clerk/nextjs'`)
    if (local.length) {
      // relative path from file to SignedInOut
      const rel = path.relative(path.dirname(f), 'src/components/auth/SignedInOut.tsx')
        .replace(/\\/g, '/')
        .replace(/\.tsx$/, '')
      const importPath = rel.startsWith('.') ? rel : `./${rel}`
      lines.push(`import { ${local.join(', ')} } from '${importPath}'`)
    }
    return lines.join('\n')
  })

  fs.writeFileSync(f, s)
  n++
  console.log(f)
}
console.log('updated', n)
