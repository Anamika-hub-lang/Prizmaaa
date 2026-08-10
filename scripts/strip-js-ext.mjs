import fs from 'node:fs'
import path from 'node:path'

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p, acc)
    else if (p.endsWith('.ts')) acc.push(p)
  }
  return acc
}

for (const f of walk('server')) {
  const s = fs.readFileSync(f, 'utf8')
  const next = s.replace(/from '(\.\/[^']+)\.js'/g, "from '$1'")
  if (next !== s) {
    fs.writeFileSync(f, next)
    console.log('fixed', f)
  }
}
