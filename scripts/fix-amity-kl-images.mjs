import fs from 'node:fs'

async function download(url, dest) {
  const r = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; PrizmaEducationBot/1.0)',
      Accept: 'image/*,*/*',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const buf = Buffer.from(await r.arrayBuffer())
  if (buf.length < 5000) throw new Error('too small')
  fs.writeFileSync(dest, buf)
  console.log('saved', dest, buf.length)
}

async function og(site) {
  const r = await fetch(site, {
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  })
  if (!r.ok) throw new Error(`site ${r.status}`)
  const html = await r.text()
  const m =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
    html.match(/name=["']twitter:image["']\s+content=["']([^"']+)["']/i)
  if (!m) return null
  let s = m[1].trim()
  if (s.startsWith('//')) s = 'https:' + s
  if (s.startsWith('/')) s = new URL(site).origin + s
  return s
}

const sites = [
  'https://www.kluniversity.in/',
  'https://www.klh.edu.in/',
  'https://klug.edu.in/',
]

let img = null
for (const site of sites) {
  try {
    img = await og(site)
    console.log(site, '=>', img)
    if (img) break
  } catch (e) {
    console.log(site, String(e))
  }
}

if (!img) {
  // fallback: Unsplash campus (reliable) — better than empty
  img =
    'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'
  console.log('using unsplash fallback')
}

await download(img, 'public/university-images/kl-university.jpg')
