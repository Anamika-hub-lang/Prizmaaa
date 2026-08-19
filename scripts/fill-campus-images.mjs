/**
 * Aggressive fill: Wikimedia Special:FilePath + homepage image scrape.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('public/university-images')
fs.mkdirSync(ROOT, { recursive: true })
const UA =
  'Mozilla/5.0 (compatible; PrizmaEducationBot/1.0; +https://localhost; campus catalog)'

const COMMONS_FILES = {
  'iit-delhi': 'IIT_Delhi_main_building.jpg',
  'iit-bombay': 'IIT_Bombay.jpg',
  'iiit-delhi': 'IIITD_Campus_2024.jpg',
  nsut: 'NSUT_(formerly_NSIT).jpg',
  jmi: 'CENTRAL_JAMIA_LIBRARY.jpg',
  'miranda-house': 'Front_Lawn_and_College..JPG',
  'nit-trichy': 'NITT_Admin_Block.jpg',
  'st-stephens': "St._Stephen's_College,_Delhi.jpg",
  du: 'Viceregal_Lodge,_Delhi.jpg',
  bhu: 'Banaras_Hindu_University_gate.jpg',
  'aiims-delhi': 'AIIMS_Delhi.jpg',
  'nit-kurukshetra': 'National_Institute_of_Technology,_Kurukshetra.jpg',
  jadavpur: 'Jadavpur_University.jpg',
  'iim-ahmedabad': 'Louis_Kahn_Plaza,_IIM_Ahmedabad.jpg',
  'iim-bangalore': 'IIM_Bangalore.jpg',
  'iit-madras': 'IIT_Madras_Administrative_Building.jpg',
  'iit-kharagpur': 'IIT_Kharagpur.jpg',
  jnu: 'JNU_campus.jpg',
  dtu: 'Delhi_Technological_University.jpg',
  'hindu-college': 'Hindu_College,_University_of_Delhi.jpg',
  'hansraj-college': 'Hansraj_College.jpg',
  lsr: 'Lady_Shri_Ram_College_for_Women.jpg',
  srcc: 'Shri_Ram_College_of_Commerce_building.jpg',
  ggsipu: 'Guru_Gobind_Singh_Indraprastha_University.jpg',
  'ku-kurukshetra': 'Kurukshetra_University_Campus.jpg',
  'mdu-rohtak': 'Maharshi_Dayanand_University.jpg',
  ashoka: 'Ashoka_University_Campus.jpg',
  jgu: 'O.P._Jindal_Global_University_Sonipat.jpg',
  'mdi-gurgaon': 'Management_Development_Institute.jpg',
  'hau-hisar': 'CCS_Haryana_Agricultural_University.jpg',
  'spa-delhi': 'School_of_Planning_and_Architecture.jpg',
  'jamia-hamdard': 'Jamia_Hamdard.jpg',
  ignou: 'IGNOU_campus.jpg',
  'ymca-faridabad': 'YMCA_University_of_Science_and_Technology.jpg',
  dcrust: 'DCRUST_Murthal.jpg',
  'gjust-hisar': 'Guru_Jambheshwar_University.jpg',
  cuh: 'Central_University_of_Haryana.jpg',
  'mm-mullana': 'Maharishi_Markandeshwar_University,_Mullana.jpg',
  northcap: 'ITM_University_Gurgaon.jpg',
  'gd-goenka': 'GD_Goenka_World_Institute.jpg',
  'manav-rachna': 'Manav_Rachna_International_University.jpg',
  'apeejay-stya': 'Apeejay_Stya_University.jpg',
  sushant: 'Ansal_University.jpg',
  'srm-sonipat': 'SRM_University_Haryana.jpg',
  'amity-haryana': 'Amity_University_Haryana.jpg',
  'pgims-rohtak': 'PGIMS_Rohtak.jpg',
  'iim-rohtak': 'IIM_Rohtak_Campus.jpg',
  'pune-university': 'Savitribai_Phule_Pune_University.jpg',
  'nit-warangal': 'NIT_Warangal.jpg',
  kmc: 'Kirori_Mal_College.jpg',
  ramjas: 'Ramjas_College.jpg',
  venky: 'Sri_Venkateswara_College.jpg',
  arsd: 'ARSD_College.jpg',
  gargi: 'Gargi_College.jpg',
  jmc: 'Jesus_and_Mary_College.jpg',
  'zakir-husain': 'Zakir_Husain_College.jpg',
  'dyal-singh': 'Dyal_Singh_College.jpg',
  deshbandhu: 'Deshbandhu_College.jpg',
  'daulat-ram': 'Daulat_Ram_College.jpg',
  'ip-college': 'Indraprastha_College_for_Women.jpg',
  'sgtb-khalsa': 'SGTB_Khalsa_College.jpg',
  sscbs: 'Shaheed_Sukhdev_College_of_Business_Studies.jpg',
  mait: 'Maharaja_Agrasen_Institute_of_Technology.jpg',
  msit: 'Maharaja_Surajmal_Institute.jpg',
  vips: 'Vivekananda_Institute_of_Professional_Studies.jpg',
  bpit: 'Bhagwan_Parshuram_Institute_of_Technology.jpg',
  'crm-jat-hisar': 'CRM_Jat_College_Hisar.jpg',
  'jat-college-rohtak': 'All_India_Jat_Heroes_Memorial_College.jpg',
}

const WEBSITES = JSON.parse(fs.readFileSync('scripts/college-websites.json', 'utf8'))

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function hasImage(id) {
  return ['.jpg', '.png', '.webp'].some((ext) => {
    const p = path.join(ROOT, `${id}${ext}`)
    return fs.existsSync(p) && fs.statSync(p).size > 3000
  })
}

async function download(url, id) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/*,*/*', Referer: 'https://commons.wikimedia.org/' },
    redirect: 'follow',
    signal: AbortSignal.timeout(25000),
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const buf = Buffer.from(await r.arrayBuffer())
  if (buf.length < 4000) throw new Error('too small')
  const ctype = (r.headers.get('content-type') || '').toLowerCase()
  if (ctype.includes('svg') || ctype.includes('html')) throw new Error('not raster')
  let ext = '.jpg'
  if (ctype.includes('png') || url.toLowerCase().includes('.png')) ext = '.png'
  else if (ctype.includes('webp') || url.toLowerCase().includes('.webp')) ext = '.webp'
  fs.writeFileSync(path.join(ROOT, `${id}${ext}`), buf)
  return `/university-images/${id}${ext}`
}

async function tryCommons(id, fileName) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=1000`
  return download(url, id)
}

function absolutize(base, src) {
  if (!src) return null
  let s = src.trim().replace(/&amp;/g, '&')
  if (s.startsWith('data:')) return null
  if (s.startsWith('//')) s = 'https:' + s
  if (s.startsWith('/')) s = new URL(base).origin + s
  if (!/^https?:\/\//i.test(s)) return null
  if (s.toLowerCase().endsWith('.svg')) return null
  return s
}

async function scrapeSiteImages(website) {
  const r = await fetch(website, {
    headers: { 'User-Agent': UA, Accept: 'text/html' },
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
  })
  if (!r.ok) return []
  const html = await r.text()
  const found = new Set()

  for (const re of [
    /property=["']og:image["']\s+content=["']([^"']+)["']/gi,
    /content=["']([^"']+)["']\s+property=["']og:image["']/gi,
    /name=["']twitter:image["']\s+content=["']([^"']+)["']/gi,
  ]) {
    let m
    while ((m = re.exec(html))) {
      const u = absolutize(website, m[1])
      if (u) found.add(u)
    }
  }

  // img tags
  const imgRe = /<img\b[^>]*>/gi
  let tag
  while ((tag = imgRe.exec(html))) {
    const chunk = tag[0]
    const src =
      chunk.match(/\bsrc=["']([^"']+)["']/i)?.[1] ||
      chunk.match(/\bdata-src=["']([^"']+)["']/i)?.[1] ||
      chunk.match(/\bdata-lazy-src=["']([^"']+)["']/i)?.[1]
    const alt = chunk.match(/\balt=["']([^"']*)["']/i)?.[1] || ''
    const u = absolutize(website, src)
    if (!u) continue
    const scoreHint = `${u} ${alt}`.toLowerCase()
    if (
      scoreHint.includes('logo') ||
      scoreHint.includes('icon') ||
      scoreHint.includes('avatar') ||
      scoreHint.includes('favicon') ||
      scoreHint.includes('sprite') ||
      scoreHint.includes('1x1')
    )
      continue
    found.add(u)
  }

  // prefer URLs that look like campus / hero / banner / building
  const ranked = [...found].sort((a, b) => {
    const score = (u) => {
      const s = u.toLowerCase()
      let n = 0
      for (const k of ['campus', 'building', 'college', 'university', 'hero', 'banner', 'slider', 'gallery', 'infra']) {
        if (s.includes(k)) n += 3
      }
      if (s.includes('.jpg') || s.includes('.jpeg') || s.includes('.webp') || s.includes('.png')) n += 1
      return n
    }
    return score(b) - score(a)
  })
  return ranked.slice(0, 6)
}

async function resolve(id) {
  if (hasImage(id)) return 'exists'

  if (COMMONS_FILES[id]) {
    try {
      await tryCommons(id, COMMONS_FILES[id])
      return 'commons'
    } catch {
      /* fall through */
    }
  }

  const site = WEBSITES[id]
  if (!site) return null
  try {
    const imgs = await scrapeSiteImages(site)
    for (const u of imgs) {
      try {
        await download(u, id)
        return 'site'
      } catch {
        /* try next */
      }
    }
  } catch {
    return null
  }
  return null
}

// ensure websites json exists (from previous script knowledge)
if (!fs.existsSync('scripts/college-websites.json')) {
  console.error('Missing scripts/college-websites.json')
  process.exit(1)
}

const ids = Object.keys(WEBSITES)
const batchSize = 6
let added = 0

for (let i = 0; i < ids.length; i += batchSize) {
  const batch = ids.slice(i, i + batchSize)
  const results = await Promise.all(
    batch.map(async (id) => {
      try {
        const how = await resolve(id)
        return { id, how }
      } catch (e) {
        return { id, how: null, err: String(e) }
      }
    }),
  )
  for (const r of results) {
    if (r.how && r.how !== 'exists') {
      added++
      console.log(`OK\t${r.id}\t${r.how}`)
    } else if (!r.how) {
      console.log(`MISS\t${r.id}`)
    }
  }
  await sleep(150)
}

const map = {}
for (const f of fs.readdirSync(ROOT)) {
  const m = f.match(/^(.+)\.(jpg|jpeg|png|webp)$/i)
  if (!m) continue
  map[m[1]] = `/university-images/${f}`
}
const lines = [
  '/** Auto-generated real campus images. Re-run image build scripts to refresh. */',
  'export const CAMPUS_IMAGES_BY_ID: Record<string, string> = {',
]
for (const id of Object.keys(map).sort()) {
  lines.push(`  '${id}': '${map[id]}',`)
}
lines.push('}')
lines.push('')
fs.writeFileSync('src/data/campusImages.generated.ts', lines.join('\n'))
console.log(`\nAdded ${added}. Total: ${Object.keys(map).length}`)
