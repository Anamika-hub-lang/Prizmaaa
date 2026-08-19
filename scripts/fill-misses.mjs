import fs from 'node:fs'
import path from 'node:path'

const ROOT = 'public/university-images'
const UA = 'Mozilla/5.0 (compatible; PrizmaEducationBot/1.0)'

const tries = {
  'iit-kharagpur': [
    'https://commons.wikimedia.org/wiki/Special:FilePath/IIT_Kharagpur_Main_Building.jpg?width=1000',
  ],
  jadavpur: ['https://commons.wikimedia.org/wiki/Special:FilePath/Jadavpur_University.jpg?width=1000'],
  igdtuw: ['https://www.igdtuw.ac.in/'],
  ggsipu: ['https://ipu.ac.in/'],
  'jamia-hamdard': ['https://www.jamiahamdard.ac.in/', 'https://jamiahamdard.edu/'],
  lhmc: ['https://www.lhmc-hosp.gov.in/'],
  vmmc: ['https://vmmc-sjh.nic.in/'],
  kmc: ['https://kmcollege.ac.in/'],
  deshbandhu: ['https://www.deshbandhucollege.ac.in/'],
  'nit-kurukshetra': [
    'https://commons.wikimedia.org/wiki/Special:FilePath/National_Institute_of_Technology_Kurukshetra.jpg?width=1000',
    'https://nitkkr.ac.in/',
  ],
  'iim-rohtak': ['https://www.iimrohtak.ac.in/'],
  'mdu-rohtak': ['https://mdu.ac.in/'],
  'ku-kurukshetra': ['https://kuk.ac.in/'],
  'pgims-rohtak': ['https://uhsr.ac.in/'],
  'hau-hisar': ['https://hau.ac.in/'],
  'amity-haryana': ['https://amity.edu/gurugram'],
  mait: ['https://mait.ac.in/'],
  'crm-jat-hisar': ['https://crmjatcollege.com/'],
  bpsmv: ['https://www.bpsmv.ac.in/'],
  'cdlu-sirsa': ['https://cdlu.ac.in/'],
  starex: ['https://starexuniversity.com/'],
  'apeejay-stya': ['https://university.apeejay.edu/'],
  mriirs: ['https://manavrachna.edu.in/'],
  mvn: ['https://mvn.edu.in/'],
  'al-falah': ['https://alfalahuniversity.edu.in/'],
  'baba-mastnath': ['https://www.babamastnathuniversity.com/'],
  'jims-rohini': ['https://www.jimsindia.org/'],
  adgitm: ['https://adgitmdelhi.ac.in/'],
  maitreyi: ['https://maitreyi.ac.in/'],
  'kamala-nehru': ['https://www.knc.edu.in/'],
  'motilal-nehru': ['https://mlnc.du.ac.in/'],
  cvs: ['https://cvs.edu.in/'],
  'igu-meerpur': ['https://igu.ac.in/'],
  'jmi': ['https://commons.wikimedia.org/wiki/Special:FilePath/CENTRAL_JAMIA_LIBRARY.jpg?width=1000'],
  'dtu': ['https://dtu.ac.in/'],
  'iim-ahmedabad': [
    'https://commons.wikimedia.org/wiki/Special:FilePath/Louis_Kahn_Plaza,_IIM_Ahmedabad.jpg?width=1000',
  ],
  'iim-bangalore': ['https://commons.wikimedia.org/wiki/Special:FilePath/IIM_Bangalore.jpg?width=1000'],
}

function has(id) {
  return ['.jpg', '.png', '.webp'].some((e) => {
    const p = path.join(ROOT, id + e)
    return fs.existsSync(p) && fs.statSync(p).size > 3000
  })
}

async function dl(url, id) {
  const r = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'image/*,*/*',
      Referer: 'https://commons.wikimedia.org/',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  })
  if (!r.ok) throw new Error('http ' + r.status)
  const buf = Buffer.from(await r.arrayBuffer())
  if (buf.length < 4000) throw new Error('small')
  const ct = (r.headers.get('content-type') || '').toLowerCase()
  if (ct.includes('html') || ct.includes('svg')) throw new Error('bad type')
  let ext = '.jpg'
  if (ct.includes('png') || url.includes('.png')) ext = '.png'
  else if (ct.includes('webp') || url.includes('.webp')) ext = '.webp'
  fs.writeFileSync(path.join(ROOT, id + ext), buf)
  return ext
}

async function og(site) {
  const r = await fetch(site, {
    headers: { 'User-Agent': UA, Accept: 'text/html' },
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
  })
  if (!r.ok) return null
  const html = await r.text()
  const m =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
    html.match(/name=["']twitter:image["']\s+content=["']([^"']+)["']/i)
  if (!m) return null
  let s = m[1]
  if (s.startsWith('//')) s = 'https:' + s
  if (s.startsWith('/')) s = new URL(site).origin + s
  return s
}

for (const [id, urls] of Object.entries(tries)) {
  if (has(id)) {
    console.log('SKIP', id)
    continue
  }
  let done = false
  for (const u of urls) {
    try {
      if (u.includes('Special:FilePath') || u.includes('upload.wikimedia.org')) {
        await dl(u, id)
        console.log('OK commons', id)
        done = true
        break
      }
      const img = await og(u)
      if (!img) continue
      await dl(img, id)
      console.log('OK og', id)
      done = true
      break
    } catch {
      /* next */
    }
  }
  if (!done) console.log('MISS', id)
}

const map = {}
for (const f of fs.readdirSync(ROOT)) {
  const m = f.match(/^(.+)\.(jpg|jpeg|png|webp)$/i)
  if (m) map[m[1]] = `/university-images/${f}`
}
const lines = [
  '/** Auto-generated real campus images. */',
  'export const CAMPUS_IMAGES_BY_ID: Record<string, string> = {',
]
for (const id of Object.keys(map).sort()) {
  lines.push(`  '${id}': '${map[id]}',`)
}
lines.push('}', '')
fs.writeFileSync('src/data/campusImages.generated.ts', lines.join('\n'))
console.log('Total', Object.keys(map).length)
