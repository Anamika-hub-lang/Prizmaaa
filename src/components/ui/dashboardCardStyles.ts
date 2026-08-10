/** Light tinted cards with thick borders — student + mentor portals. */
export const dashboardCardBorder = 'border-2'

export const dashboardTints = [
  { bg: 'bg-[#fff4eb]', border: 'border-orange-200' },
  { bg: 'bg-sky-50', border: 'border-sky-200' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { bg: 'bg-violet-50', border: 'border-violet-200' },
  { bg: 'bg-amber-50', border: 'border-amber-200' },
  { bg: 'bg-rose-50', border: 'border-rose-200' },
] as const

export function dashboardTint(index: number) {
  return dashboardTints[index % dashboardTints.length]
}

export function tintFromKey(key: string) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h + key.charCodeAt(i)) % dashboardTints.length
  return dashboardTint(h)
}

export function tintedSurface(index: number, extra = '') {
  const t = dashboardTint(index)
  return `${dashboardCardBorder} ${t.bg} ${t.border} rounded-2xl ${extra}`.trim()
}

export function tintedSurfaceKey(key: string, extra = '') {
  const t = tintFromKey(key)
  return `${dashboardCardBorder} ${t.bg} ${t.border} rounded-2xl ${extra}`.trim()
}
