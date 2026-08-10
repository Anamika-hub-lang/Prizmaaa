import fs from 'node:fs'
import path from 'node:path'

function walk(d, acc = []) {
  if (!fs.existsSync(d)) return acc
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p, acc)
    else if (/\.(tsx?|jsx?|mjs|md)$/.test(e.name)) acc.push(p)
  }
  return acc
}

const files = [...walk('app'), ...walk('src'), ...walk('scripts')]
let n = 0
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8')
  const next = s.split('@/views/').join('@/views/')
  if (next !== s) {
    fs.writeFileSync(f, next)
    n++
    console.log(f)
  }
}
console.log('updated', n)

// Remove src/pages after copy so Next doesn't treat it as Pages Router
function rmrf(dir) {
  if (!fs.existsSync(dir)) return
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) rmrf(p)
    else fs.unlinkSync(p)
  }
  try {
    fs.rmdirSync(dir)
  } catch (err) {
    console.warn('could not rmdir', dir, err.message)
  }
}
rmrf('src/pages')
console.log('pages removed?', !fs.existsSync('src/pages'))
