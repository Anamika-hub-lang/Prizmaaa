export function slugifyClassTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
  return slug || 'class'
}

function shortClassToken(id: string): string {
  return id.replace(/^class-/i, '').slice(-6)
}

export function attachClassSlugs<T extends { id: string; title: string }>(
  classes: T[],
): Array<T & { slug: string }> {
  const bases = classes.map((cls) => ({ id: cls.id, base: slugifyClassTitle(cls.title) }))
  const counts = new Map<string, number>()
  for (const item of bases) {
    counts.set(item.base, (counts.get(item.base) ?? 0) + 1)
  }
  return classes.map((cls, index) => {
    const base = bases[index].base
    const slug = (counts.get(base) ?? 0) > 1 ? `${base}-${shortClassToken(cls.id)}` : base
    return { ...cls, slug }
  })
}

export function classPublicPath(cls: { id: string; title: string; slug?: string }): string {
  return `/classes/${cls.slug ?? slugifyClassTitle(cls.title)}`
}
