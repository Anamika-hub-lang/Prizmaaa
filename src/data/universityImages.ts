import { CAMPUS_IMAGES_BY_ID } from './campusImages.generated'

/** Fallback campus / education photos (Unsplash) when a real campus shot is missing. */
export const DEFAULT_UNIVERSITY_IMAGE =
  'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'

export const UNIVERSITY_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf88?w=800&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=80',
  'https://images.unsplash.com/photo-1607237138185-eedd9c632b0f?w=800&q=80',
  'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&q=80',
  'https://images.unsplash.com/photo-1509062528406-3165a57f462f?w=800&q=80',
  'https://images.unsplash.com/photo-1497633762263-10fc82840fd5?w=800&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793688353f?w=800&q=80',
  'https://images.unsplash.com/photo-15172453868-7e195c9343e8?w=800&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
  'https://images.unsplash.com/photo-1488190218345-48145ad01a20?w=800&q=80',
  'https://images.unsplash.com/photo-1524995997942-81eec4e8f048?w=800&q=80',
  'https://images.unsplash.com/photo-1427504494783-3da5494bdd3e?w=800&q=80',
  'https://images.unsplash.com/photo-1544717297-fa95b72ee596?w=800&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80',
  'https://images.unsplash.com/photo-1592286941015-8b9b2b7d2b65?w=800&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
] as const

export function universityImageAt(index: number): string {
  return UNIVERSITY_IMAGE_POOL[index % UNIVERSITY_IMAGE_POOL.length] ?? DEFAULT_UNIVERSITY_IMAGE
}

/** Manual fixes when a scraped/local campus photo is wrong (e.g. unrelated wildlife). */
const UNIVERSITY_IMAGE_OVERRIDES: Record<string, string> = {
  'iit-bombay':
    'https://images.unsplash.com/photo-1562774053-701939374585?w=900&q=80',
  mit: 'https://images.unsplash.com/photo-1541339907198-e08756dedf88?w=900&q=80',
}

/** Prefer a real downloaded campus photo; otherwise cycle the Unsplash pool. */
export function universityImageFor(id: string, index: number): string {
  return UNIVERSITY_IMAGE_OVERRIDES[id] ?? CAMPUS_IMAGES_BY_ID[id] ?? universityImageAt(index)
}
