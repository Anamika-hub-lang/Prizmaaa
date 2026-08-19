import { jsonCollegeRepository } from './jsonRepository'

/** Replace `jsonCollegeRepository` with an API/DB provider when ready. */
export const collegeRepository = jsonCollegeRepository

export * from './types'
export * from './repository'
export { getAdmissionPath, POPULAR_COMPANY_SUGGESTIONS } from './admissionPath'
export { matchColleges, defaultFinderPreferences } from './matcher'
