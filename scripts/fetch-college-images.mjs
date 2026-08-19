/**
 * Fetch a real campus-ish photo from Wikimedia Commons / Wikipedia for each college.
 * Prefers JPG/PNG photos over SVG logos.
 */
const colleges = [
  { id: 'iit-delhi', q: 'Indian Institute of Technology Delhi' },
  { id: 'jnu', q: 'Jawaharlal Nehru University' },
  { id: 'du', q: 'University of Delhi' },
  { id: 'jmi', q: 'Jamia Millia Islamia' },
  { id: 'dtu', q: 'Delhi Technological University' },
  { id: 'nsut', q: 'Netaji Subhas University of Technology' },
  { id: 'iiit-delhi', q: 'Indraprastha Institute of Information Technology Delhi' },
  { id: 'nit-delhi', q: 'National Institute of Technology Delhi' },
  { id: 'aiims-delhi', q: 'All India Institute of Medical Sciences New Delhi' },
  { id: 'hindu-college', q: 'Hindu College Delhi' },
  { id: 'miranda-house', q: 'Miranda House' },
  { id: 'hansraj-college', q: 'Hans Raj College' },
  { id: 'st-stephens', q: "St. Stephen's College Delhi" },
  { id: 'lsr', q: 'Lady Shri Ram College for Women' },
  { id: 'srcc', q: 'Shri Ram College of Commerce' },
  { id: 'kmc', q: 'Kirori Mal College' },
  { id: 'ramjas', q: 'Ramjas College' },
  { id: 'venky', q: 'Sri Venkateswara College Delhi' },
  { id: 'arsd', q: 'Atma Ram Sanatan Dharma College' },
  { id: 'gargi', q: 'Gargi College' },
  { id: 'jmc', q: 'Jesus and Mary College' },
  { id: 'ggsipu', q: 'Guru Gobind Singh Indraprastha University' },
  { id: 'igdtuw', q: 'Indira Gandhi Delhi Technical University for Women' },
  { id: 'lhmc', q: 'Lady Hardinge Medical College' },
  { id: 'mamc', q: 'Maulana Azad Medical College' },
  { id: 'fms-delhi', q: 'Faculty of Management Studies Delhi' },
  { id: 'sgt', q: 'SGT University' },
  { id: 'gd-goenka', q: 'GD Goenka University' },
  { id: 'amity-haryana', q: 'Amity University Haryana' },
  { id: 'jgu', q: 'O.P. Jindal Global University' },
  { id: 'nit-kurukshetra', q: 'National Institute of Technology Kurukshetra' },
  { id: 'mdu-rohtak', q: 'Maharshi Dayanand University' },
  { id: 'ku-kurukshetra', q: 'Kurukshetra University' },
  { id: 'ashoka', q: 'Ashoka University' },
  { id: 'mdi-gurgaon', q: 'Management Development Institute' },
  { id: 'iim-rohtak', q: 'Indian Institute of Management Rohtak' },
  { id: 'manav-rachna', q: 'Manav Rachna University' },
  { id: 'northcap', q: 'The NorthCap University' },
  { id: 'bml-munjal', q: 'BML Munjal University' },
  { id: 'kr-mangalam', q: 'K.R. Mangalam University' },
  { id: 'gjust-hisar', q: 'Guru Jambheshwar University of Science and Technology' },
  { id: 'dcrust', q: 'Deenbandhu Chhotu Ram University of Science and Technology' },
  { id: 'ymca-faridabad', q: 'JC Bose University of Science and Technology YMCA' },
  { id: 'mm-mullana', q: 'Maharishi Markandeshwar University Mullana' },
  { id: 'cuh', q: 'Central University of Haryana' },
  { id: 'pgims-rohtak', q: 'PGIMS Rohtak' },
  { id: 'crm-jat-hisar', q: 'CRM JAT College' },
  { id: 'jat-college-rohtak', q: 'All India Jat Heroes Memorial College' },
  { id: 'srm-sonipat', q: 'SRM University Haryana' },
  { id: 'apeejay-stya', q: 'Apeejay Stya University' },
  { id: 'sushant', q: 'Sushant University' },
  { id: 'hau-hisar', q: 'Chaudhary Charan Singh Haryana Agricultural University' },
  { id: 'bpsmv', q: 'Bhagat Phool Singh Mahila Vishwavidyalaya' },
  { id: 'cdlu-sirsa', q: 'Chaudhary Devi Lal University' },
  { id: 'gurugram-university', q: 'Gurugram University' },
  { id: 'sscbs', q: 'Shaheed Sukhdev College of Business Studies' },
  { id: 'sgtb-khalsa', q: 'Sri Guru Tegh Bahadur Khalsa College' },
  { id: 'daulat-ram', q: 'Daulat Ram College' },
  { id: 'ip-college', q: 'Indraprastha College for Women' },
  { id: 'lady-irwin', q: 'Lady Irwin College' },
  { id: 'mait', q: 'Maharaja Agrasen Institute of Technology' },
  { id: 'msit', q: 'Maharaja Surajmal Institute of Technology' },
  { id: 'vips', q: 'Vivekananda Institute of Professional Studies' },
  { id: 'bpit', q: 'Bhagwan Parshuram Institute of Technology' },
  { id: 'iit-bombay', q: 'Indian Institute of Technology Bombay' },
  { id: 'iit-madras', q: 'Indian Institute of Technology Madras' },
  { id: 'iit-kanpur', q: 'Indian Institute of Technology Kanpur' },
  { id: 'iit-kharagpur', q: 'Indian Institute of Technology Kharagpur' },
  { id: 'iit-roorkee', q: 'Indian Institute of Technology Roorkee' },
  { id: 'bits-pilani', q: 'Birla Institute of Technology and Science Pilani' },
  { id: 'nit-trichy', q: 'National Institute of Technology Tiruchirappalli' },
  { id: 'nit-warangal', q: 'National Institute of Technology Warangal' },
  { id: 'iisc-bangalore', q: 'Indian Institute of Science' },
  { id: 'vit-vellore', q: 'Vellore Institute of Technology' },
  { id: 'manipal', q: 'Manipal Academy of Higher Education' },
  { id: 'srm', q: 'SRM Institute of Science and Technology' },
  { id: 'anna-university', q: 'Anna University' },
  { id: 'jadavpur', q: 'Jadavpur University' },
  { id: 'iim-ahmedabad', q: 'Indian Institute of Management Ahmedabad' },
  { id: 'iim-bangalore', q: 'Indian Institute of Management Bangalore' },
  { id: 'amity', q: 'Amity University Noida' },
  { id: 'lpu', q: 'Lovely Professional University' },
  { id: 'pune-university', q: 'Savitribai Phule Pune University' },
  { id: 'bhu', q: 'Banaras Hindu University' },
  { id: 'thapar', q: 'Thapar Institute of Engineering and Technology' },
]

const UA = 'PrizmaEducationApp/1.0 (local college catalog images; contact: local-dev)'

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function isPhotoFile(name) {
  const n = name.toLowerCase()
  if (n.endsWith('.svg')) return false
  if (n.includes('logo') || n.includes('seal') || n.includes('shield') || n.includes('crest')) return false
  return n.endsWith('.jpg') || n.endsWith('.jpeg') || n.endsWith('.png') || n.endsWith('.webp')
}

async function wikiApi(params) {
  const url = new URL('https://en.wikipedia.org/w/api.php')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  url.searchParams.set('format', 'json')
  url.searchParams.set('origin', '*')
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  if (r.status === 429) {
    await sleep(2000)
    return wikiApi(params)
  }
  if (!r.ok) throw new Error(`wiki ${r.status}`)
  return r.json()
}

async function commonsSearch(query) {
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  url.searchParams.set('action', 'query')
  url.searchParams.set('list', 'search')
  url.searchParams.set('srsearch', `${query} campus OR building OR college OR university`)
  url.searchParams.set('srnamespace', '6')
  url.searchParams.set('srlimit', '8')
  url.searchParams.set('format', 'json')
  url.searchParams.set('origin', '*')
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  if (r.status === 429) {
    await sleep(2500)
    return commonsSearch(query)
  }
  if (!r.ok) return []
  const j = await r.json()
  return (j.query?.search || []).map((s) => s.title)
}

async function fileUrl(fileTitle) {
  const j = await wikiApi({
    action: 'query',
    titles: fileTitle.startsWith('File:') ? fileTitle : `File:${fileTitle}`,
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: 800,
  })
  // imageinfo is on en.wikipedia; for commons files use commons host
  const pages = j.query?.pages || {}
  for (const p of Object.values(pages)) {
    const info = p.imageinfo?.[0]
    if (info?.thumburl) return info.thumburl
    if (info?.url) return info.url
  }

  const curl = new URL('https://commons.wikimedia.org/w/api.php')
  curl.searchParams.set('action', 'query')
  curl.searchParams.set('titles', fileTitle.startsWith('File:') ? fileTitle : `File:${fileTitle}`)
  curl.searchParams.set('prop', 'imageinfo')
  curl.searchParams.set('iiprop', 'url')
  curl.searchParams.set('iiurlwidth', '800')
  curl.searchParams.set('format', 'json')
  curl.searchParams.set('origin', '*')
  const r = await fetch(curl, { headers: { 'User-Agent': UA } })
  const cj = await r.json()
  for (const p of Object.values(cj.query?.pages || {})) {
    const info = p.imageinfo?.[0]
    if (info?.thumburl) return info.thumburl
    if (info?.url) return info.url
  }
  return null
}

async function pagePhoto(title) {
  // 1) pageimages
  const pi = await wikiApi({
    action: 'query',
    titles: title,
    prop: 'pageimages',
    piprop: 'thumbnail|original',
    pithumbsize: 800,
  })
  const page = Object.values(pi.query?.pages || {})[0]
  if (page?.missing == null) {
    const orig = page.original?.source
    const thumb = page.thumbnail?.source
    const cand = orig || thumb
    if (cand && !cand.includes('.svg')) return cand
  }

  // 2) images on page
  const imgs = await wikiApi({
    action: 'query',
    titles: title,
    prop: 'images',
    imlimit: 20,
  })
  const page2 = Object.values(imgs.query?.pages || {})[0]
  const files = (page2?.images || []).map((i) => i.title).filter(isPhotoFile)
  for (const f of files.slice(0, 5)) {
    const u = await fileUrl(f)
    if (u && !u.includes('.svg')) return u
    await sleep(80)
  }

  // 3) commons search
  const hits = await commonsSearch(title)
  for (const h of hits) {
    if (!isPhotoFile(h)) continue
    const u = await fileUrl(h)
    if (u) return u
    await sleep(80)
  }
  return null
}

const out = {}
for (const c of colleges) {
  try {
    const img = await pagePhoto(c.q)
    out[c.id] = img
    console.log(`${img ? 'OK' : 'MISS'}\t${c.id}\t${img || ''}`)
  } catch (e) {
    out[c.id] = null
    console.log(`ERR\t${c.id}\t${e}`)
  }
  await sleep(350)
}

const fs = await import('node:fs')
fs.mkdirSync('scripts', { recursive: true })
fs.writeFileSync('scripts/college-image-map.json', JSON.stringify(out, null, 2))
console.log('\nWrote scripts/college-image-map.json')
console.log('Found', Object.values(out).filter(Boolean).length, '/', colleges.length)
