import type { College } from './types'

const ENTRANCE_PATHS: Record<string, string[]> = {
  'JEE Advanced': [
    'Prepare for JEE Main',
    'Clear JEE Advanced',
    'JoSAA counselling',
    'Seat allotment & admission',
  ],
  'JEE Main': ['Prepare for JEE Main', 'Counselling (JoSAA / state)', 'Seat allotment & admission'],
  BITSAT: ['Register for BITSAT', 'Appear & score well', 'BITS counselling', 'Admission'],
  VITEEE: ['Register for VITEEE', 'Appear & score well', 'VIT counselling', 'Admission'],
  CUET: ['Register for CUET', 'Choose subjects & score', 'University counselling', 'Admission'],
  'NEET UG': ['Prepare for NEET UG', 'Appear & qualify', 'MCC / state counselling', 'MBBS admission'],
  'NEET PG': ['Complete MBBS', 'Prepare for NEET PG', 'Counselling', 'Specialisation admission'],
  CAT: ['Prepare for CAT', 'Score percentile', 'GD-PI rounds', 'MBA admission'],
  LPUNEST: ['Register for LPUNEST', 'Appear & score', 'LPU counselling', 'Admission'],
  MET: ['Register for MET', 'Appear & score', 'Manipal counselling', 'Admission'],
  'Amity JEE': ['Register for Amity JEE', 'Appear or use JEE Main score', 'Counselling', 'Admission'],
  JNUEE: ['Register for CUET / JNUEE', 'Score & apply', 'Merit list', 'Admission'],
  'Thapar Entrance': ['JEE Main or Thapar entrance', 'Apply with score', 'Counselling', 'Admission'],
  HSTES: ['Register for HSTES / JEE Main', 'Haryana state counselling', 'Seat allotment', 'Admission'],
  CLAT: ['Prepare for CLAT', 'Appear & score rank', 'NLU / university counselling', 'Law admission'],
  'Jindal SAT': ['Register for Jindal SAT / CLAT', 'Appear & interview', 'Merit list', 'Admission'],
  MRNAT: ['Register for MRNAT / JEE Main', 'Appear & score', 'Counselling', 'Admission'],
  'BMU SAT': ['JEE Main or BMU SAT', 'Apply with score', 'Counselling', 'Admission'],
  'GDGU Entrance': ['JEE Main or GDGU entrance', 'Apply & appear', 'Counselling', 'Admission'],
  'SGT Entrance': ['JEE Main / NEET / SGT entrance', 'Apply with score', 'Counselling', 'Admission'],
}

const TYPE_PATHS: Record<string, string[]> = {
  IIT: ['Prepare for JEE Main', 'Clear JEE Advanced', 'JoSAA counselling', 'IIT admission'],
  NIT: ['Prepare for JEE Main', 'JoSAA counselling', 'NIT seat allotment', 'Admission'],
  IIM: ['Prepare for CAT', 'Score percentile', 'GD-PI rounds', 'IIM admission'],
}

export function getAdmissionPath(college: College): string[] {
  const shortName = college.name.split(',')[0].trim()

  for (const exam of college.entrance) {
    const template = ENTRANCE_PATHS[exam]
    if (template) {
      return [...template.slice(0, -1), `Admission at ${shortName}`]
    }
  }

  const typePath = TYPE_PATHS[college.type]
  if (typePath) {
    return [...typePath.slice(0, -1), `Admission at ${shortName}`]
  }

  if (college.entrance.length > 0) {
    return [
      `Prepare for ${college.entrance.join(' / ')}`,
      'Apply & appear for exam',
      'Counselling / merit list',
      `Admission at ${shortName}`,
    ]
  }

  return ['Check eligibility', 'Apply online', 'Merit / interview', `Admission at ${shortName}`]
}

export const POPULAR_COMPANY_SUGGESTIONS = [
  'Google',
  'Microsoft',
  'Amazon',
  'Adobe',
  'Deloitte',
  'TCS',
  'Goldman Sachs',
  'McKinsey',
] as const
