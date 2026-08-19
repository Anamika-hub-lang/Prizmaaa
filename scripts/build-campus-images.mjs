/**
 * Faster campus image builder:
 *  - Curated Wikimedia files for known campuses
 *  - Official website og:image (parallel batches)
 * Writes public/university-images/* and src/data/campusImages.generated.ts
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('public/university-images')
fs.mkdirSync(ROOT, { recursive: true })

const UA = 'PrizmaEducationApp/1.0 (campus images for student reviews)'

/** Known Wikimedia Commons file names (campus / building photos). */
const CURATED = {
  'iit-delhi': 'IIT_Delhi_main_building.jpg',
  'iit-bombay': 'IIT_Bombay_Main_Building.jpg',
  'iiit-delhi': 'IIITD_Campus_2024.jpg',
  nsut: 'NSUT_(formerly_NSIT).jpg',
  jmi: 'CENTRAL_JAMIA_LIBRARY.jpg',
  'miranda-house': 'Front_Lawn_and_College..JPG',
  'nit-delhi': 'Academic_block_inside.jpg',
}

/** id -> official website for og:image */
const WEBSITES = {
  'iit-bombay': 'https://www.iitb.ac.in/',
  'iit-delhi': 'https://home.iitd.ac.in/',
  'iit-madras': 'https://www.iitm.ac.in/',
  'iit-kanpur': 'https://www.iitk.ac.in/',
  'iit-kharagpur': 'https://www.iitkgp.ac.in/',
  'iit-roorkee': 'https://www.iitr.ac.in/',
  'bits-pilani': 'https://www.bits-pilani.ac.in/',
  'nit-trichy': 'https://www.nitt.edu/',
  'nit-warangal': 'https://www.nitw.ac.in/',
  'iisc-bangalore': 'https://iisc.ac.in/',
  'vit-vellore': 'https://vit.ac.in/',
  manipal: 'https://manipal.edu/',
  srm: 'https://www.srmist.edu.in/',
  'anna-university': 'https://www.annauniv.edu/',
  jadavpur: 'https://www.jaduniv.edu.in/',
  'iim-ahmedabad': 'https://www.iima.ac.in/',
  'iim-bangalore': 'https://www.iimb.ac.in/',
  amity: 'https://www.amity.edu/',
  lpu: 'https://www.lpu.in/',
  'pune-university': 'http://www.unipune.ac.in/',
  bhu: 'https://www.bhu.ac.in/',
  thapar: 'https://www.thapar.edu/',
  du: 'https://www.du.ac.in/',
  jnu: 'https://www.jnu.ac.in/',
  jmi: 'https://www.jmi.ac.in/',
  dtu: 'https://dtu.ac.in/',
  nsut: 'https://www.nsut.ac.in/',
  'iiit-delhi': 'https://www.iiitd.ac.in/',
  'nit-delhi': 'https://nitdelhi.ac.in/',
  igdtuw: 'https://www.igdtuw.ac.in/',
  ggsipu: 'https://www.ipu.ac.in/',
  'jamia-hamdard': 'https://jamiahamdard.edu/',
  'spa-delhi': 'https://spa.ac.in/',
  'aiims-delhi': 'https://www.aiims.edu/',
  mamc: 'https://mamc.delhi.gov.in/',
  lhmc: 'https://lhmc-hosp.gov.in/',
  ucms: 'https://www.ucms.ac.in/',
  vmmc: 'https://www.vmmc-sjh.nic.in/',
  'fms-delhi': 'https://www.fms.edu/',
  'nift-delhi': 'https://www.nift.ac.in/delhi',
  ignou: 'https://www.ignou.ac.in/',
  'hindu-college': 'https://hinducollege.ac.in/',
  'hansraj-college': 'https://www.hansrajcollege.ac.in/',
  kmc: 'https://www.kmcollege.ac.in/',
  ramjas: 'https://ramjas.du.ac.in/',
  'st-stephens': 'https://www.ststephens.edu/',
  'miranda-house': 'https://www.mirandahouse.ac.in/',
  srcc: 'https://www.srcc.edu/',
  lsr: 'https://lsr.edu.in/',
  'daulat-ram': 'https://dr.du.ac.in/',
  'ip-college': 'https://www.ipcollege.ac.in/',
  'sgtb-khalsa': 'https://sgtbkhalsadu.ac.in/',
  sscbs: 'https://sscbs.du.ac.in/',
  venky: 'https://www.svc.ac.in/',
  arsd: 'https://www.arsdcollege.ac.in/',
  jmc: 'https://www.jmc.ac.in/',
  gargi: 'https://www.gargicollege.in/',
  maitreyi: 'https://maitreyi.du.ac.in/',
  'kamala-nehru': 'https://www.knc.edu.in/',
  deshbandhu: 'https://www.deshbandhucollege.ac.in/',
  'motilal-nehru': 'https://mlncdu.ac.in/',
  dcac: 'https://dcac.du.ac.in/',
  cvs: 'https://www.cvs.edu.in/',
  'ram-lal-anand': 'https://rlacollege.edu.in/',
  aryabhatta: 'https://aryabhattacollege.ac.in/',
  andc: 'https://andcollege.du.ac.in/',
  'sri-aurobindo': 'https://www.aurobindo.du.ac.in/',
  'sbs-college': 'https://www.sbsc.in/',
  ihe: 'https://www.ihe-du.com/',
  'lady-irwin': 'https://ladyirwin.edu.in/',
  'shivaji-college': 'https://www.shivajicollege.ac.in/',
  satyawati: 'https://satyawati.du.ac.in/',
  'keshav-mv': 'https://keshav.du.ac.in/',
  'ddu-college': 'https://dducollegedu.ac.in/',
  'maharaja-agrasen-college': 'https://mac.du.ac.in/',
  ramanujan: 'https://ramanujancollege.ac.in/',
  pgdav: 'https://pgdavcollege.in/',
  'shyam-lal': 'https://www.shyamlal.du.ac.in/',
  'vivekananda-college': 'https://vivekanandacollege.edu.in/',
  kalindi: 'https://kalindi.du.ac.in/',
  lakshmibai: 'https://lakshmibaicollege.in/',
  jdmc: 'https://jdm.du.ac.in/',
  'mata-sundri': 'https://mscw.ac.in/',
  'bharati-college': 'https://www.bharaticollege.du.ac.in/',
  'bhagini-nivedita': 'https://bhagininivedita.du.ac.in/',
  bcas: 'https://bcas.du.ac.in/',
  brac: 'https://www.drbrambedkarcollege.ac.in/',
  'zakir-husain': 'https://www.zakirhusaindelhicollege.ac.in/',
  sggscc: 'https://www.sggscc.ac.in/',
  'sgnd-khalsa': 'https://www.sgndkc.org/',
  'aditi-mv': 'https://aditi.du.ac.in/',
  'ssn-college': 'https://ss.du.ac.in/',
  rajdhani: 'https://rajdhanicollege.ac.in/',
  'shaheed-rajguru': 'https://www.rajgurucollege.com/',
  'dyal-singh': 'https://www.dsc.du.ac.in/',
  'spm-college': 'https://spm.du.ac.in/',
  mait: 'https://mait.ac.in/',
  msit: 'https://www.msit.in/',
  bpit: 'https://www.bpitindia.com/',
  bvcoe: 'https://bvcoend.ac.in/',
  gtbit: 'https://www.gtbit.org/',
  vips: 'https://vips.edu/',
  adgitm: 'https://www.adgitmdelhi.ac.in/',
  maims: 'https://maims.ac.in/',
  'jims-rohini': 'https://www.jimsindia.org/',
  'nit-kurukshetra': 'https://nitkkr.ac.in/',
  'iim-rohtak': 'https://www.iimrohtak.ac.in/',
  'mdi-gurgaon': 'https://www.mdi.ac.in/',
  'mdu-rohtak': 'https://mdu.ac.in/',
  'ku-kurukshetra': 'https://www.kuk.ac.in/',
  'gjust-hisar': 'https://www.gjust.ac.in/',
  cuh: 'https://www.cuh.ac.in/',
  'ymca-faridabad': 'https://jcboseust.ac.in/',
  dcrust: 'https://www.dcrustm.ac.in/',
  'pgims-rohtak': 'https://uhsr.ac.in/',
  bpsmv: 'https://bpsmv.ac.in/',
  'cdlu-sirsa': 'https://www.cdlu.ac.in/',
  'hau-hisar': 'https://hau.ac.in/',
  luvas: 'https://www.luvas.edu.in/',
  'igu-meerpur': 'https://igu.ac.in/',
  'gurugram-university': 'https://gurugramuniversity.ac.in/',
  dbranlu: 'https://dbranlu.ac.in/',
  sgt: 'https://sgtuniversity.ac.in/',
  'gd-goenka': 'https://www.gdgoenkauniversity.com/',
  'kr-mangalam': 'https://www.krmangalam.edu.in/',
  'amity-haryana': 'https://www.amity.edu/gurugram/',
  northcap: 'https://www.ncuindia.edu/',
  'bml-munjal': 'https://www.bmu.edu.in/',
  'apeejay-stya': 'https://university.apeejay.edu/',
  'iilm-gurgaon': 'https://www.iilm.edu/',
  starex: 'https://www.starexuniversity.com/',
  sushant: 'https://sushantuniversity.edu.in/',
  jgu: 'https://jgu.edu.in/',
  ashoka: 'https://www.ashoka.edu.in/',
  'srm-sonipat': 'https://www.srmuniversity.ac.in/',
  rishihood: 'https://rishihood.edu.in/',
  wud: 'https://wud.ac.in/',
  'manav-rachna': 'https://manavrachna.edu.in/',
  mriirs: 'https://mriirs.edu.in/',
  'al-falah': 'https://alfalahuniversity.edu.in/',
  mvn: 'https://www.mvn.edu.in/',
  pdm: 'https://www.pdm.ac.in/',
  'jagannath-jhajjar': 'https://www.jagannathuniversityncr.ac.in/',
  'geeta-panipat': 'https://www.geetauniversity.edu.in/',
  'mm-mullana': 'https://www.mmumullana.org/',
  'baba-mastnath': 'https://bmu.ac.in/',
  'om-sterling': 'https://www.osgu.ac.in/',
  'niilm-kaithal': 'https://www.niilmuniversity.ac.in/',
  'jat-college-rohtak': 'https://jatcollegerohtak.ac.in/',
  'crm-jat-hisar': 'https://www.crmjatcollege.com/',
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function commonsUrl(fileName) {
  const title = fileName.startsWith('File:') ? fileName : `File:${fileName}`
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  url.searchParams.set('action', 'query')
  url.searchParams.set('titles', title)
  url.searchParams.set('prop', 'imageinfo')
  url.searchParams.set('iiprop', 'url|mime')
  url.searchParams.set('iiurlwidth', '1000')
  url.searchParams.set('format', 'json')
  url.searchParams.set('origin', '*')
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!r.ok) return null
  const j = await r.json()
  for (const p of Object.values(j.query?.pages || {})) {
    if (p.missing != null) return null
    const info = p.imageinfo?.[0]
    if (!info) return null
    if ((info.mime || '').includes('svg')) return null
    return info.thumburl || info.url
  }
  return null
}

async function ogImage(website) {
  try {
    const r = await fetch(website, {
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })
    if (!r.ok) return null
    const html = await r.text()
    const patterns = [
      /property=["']og:image["']\s+content=["']([^"']+)["']/i,
      /content=["']([^"']+)["']\s+property=["']og:image["']/i,
      /name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
      /content=["']([^"']+)["']\s+name=["']twitter:image["']/i,
      /rel=["']image_src["']\s+href=["']([^"']+)["']/i,
    ]
    for (const re of patterns) {
      const m = html.match(re)
      if (!m?.[1]) continue
      let src = m[1].trim()
      if (src.startsWith('//')) src = 'https:' + src
      if (src.startsWith('/')) src = new URL(website).origin + src
      if (/^https?:\/\//i.test(src) && !src.toLowerCase().endsWith('.svg')) return src
    }
  } catch {
    return null
  }
  return null
}

async function download(url, id) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/*,*/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const buf = Buffer.from(await r.arrayBuffer())
  if (buf.length < 3000) throw new Error('too small')
  const ctype = (r.headers.get('content-type') || '').toLowerCase()
  let ext = '.jpg'
  if (ctype.includes('png') || url.toLowerCase().includes('.png')) ext = '.png'
  else if (ctype.includes('webp') || url.toLowerCase().includes('.webp')) ext = '.webp'
  const file = path.join(ROOT, `${id}${ext}`)
  fs.writeFileSync(file, buf)
  return `/university-images/${id}${ext}`
}

async function resolveOne(id, website) {
  for (const ext of ['.jpg', '.png', '.webp']) {
    const existing = path.join(ROOT, `${id}${ext}`)
    if (fs.existsSync(existing) && fs.statSync(existing).size > 3000) {
      return `/university-images/${id}${ext}`
    }
  }

  if (CURATED[id]) {
    const u = await commonsUrl(CURATED[id])
    if (u) {
      try {
        return await download(u, id)
      } catch {
        /* continue */
      }
    }
  }

  if (website) {
    const og = await ogImage(website)
    if (og) {
      try {
        return await download(og, id)
      } catch {
        /* continue */
      }
    }
  }
  return null
}

const ids = Object.keys(WEBSITES)
const map = {}
const batchSize = 8

for (let i = 0; i < ids.length; i += batchSize) {
  const batch = ids.slice(i, i + batchSize)
  const results = await Promise.all(
    batch.map(async (id) => {
      try {
        const local = await resolveOne(id, WEBSITES[id])
        return { id, local }
      } catch (e) {
        return { id, local: null, err: String(e) }
      }
    }),
  )
  for (const r of results) {
    if (r.local) {
      map[r.id] = r.local
      console.log(`OK\t${r.id}\t${r.local}`)
    } else {
      console.log(`MISS\t${r.id}${r.err ? `\t${r.err}` : ''}`)
    }
  }
  await sleep(200)
}

for (const f of fs.readdirSync(ROOT)) {
  const m = f.match(/^(.+)\.(jpg|jpeg|png|webp)$/i)
  if (!m) continue
  const id = m[1]
  if (!map[id]) map[id] = `/university-images/${f}`
}

const lines = [
  '/** Auto-generated real campus images. Re-run: node scripts/build-campus-images.mjs */',
  'export const CAMPUS_IMAGES_BY_ID: Record<string, string> = {',
]
for (const id of Object.keys(map).sort()) {
  lines.push(`  '${id}': '${map[id]}',`)
}
lines.push('}')
lines.push('')
fs.writeFileSync('src/data/campusImages.generated.ts', lines.join('\n'))
fs.writeFileSync('scripts/college-image-map.json', JSON.stringify(map, null, 2))
console.log(`\nDone: ${Object.keys(map).length} campus images`)
