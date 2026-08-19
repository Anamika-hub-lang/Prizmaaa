import collegesData from '../../../data/colleges.json'
import type { CollegeRepository } from './repository'
import type { College } from './types'

const colleges = collegesData as College[]

export const jsonCollegeRepository: CollegeRepository = {
  async getAll() {
    return colleges
  },

  async getBySlug(slug: string) {
    return colleges.find((c) => c.slug === slug)
  },

  async getBySlugs(slugs: string[]) {
    const set = new Set(slugs)
    return colleges.filter((c) => set.has(c.slug))
  },
}
