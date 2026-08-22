import type { UserProfileRecord } from '../lib/saveProfileDetails'

export type ProfileCompletionItem = {
  id: string
  label: string
  done: boolean
}

function filled(s: string | null | undefined): boolean {
  return Boolean(s?.trim())
}

export function buildProfileCompletion(
  role: 'student' | 'teacher',
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  row: UserProfileRecord | null,
  extras?: { hasProfilePhoto?: boolean },
): { percent: number; items: ProfileCompletionItem[] } {
  const items: ProfileCompletionItem[] = [
    {
      id: 'firstName',
      label: 'First name',
      done: filled(firstName),
    },
    {
      id: 'lastName',
      label: 'Last name',
      done: filled(lastName),
    },
    {
      id: 'phone',
      label: 'Phone (WhatsApp, optional)',
      done: filled(row?.phone),
    },
    {
      id: 'howFind',
      label: 'How you found PRIZMA',
      done: filled(row?.how_did_you_find_us),
    },
  ]

  const how = row?.how_did_you_find_us
  if (how === 'reference' || how === 'other') {
    items.push({
      id: 'howFindDetail',
      label: how === 'reference' ? 'Reference details' : 'Other — please specify',
      done: filled(row?.how_did_you_find_us_detail),
    })
  }

  if (role === 'student') {
    items.push(
      {
        id: 'education',
        label: 'Education level',
        done: filled(row?.student_education_level),
      },
      {
        id: 'grade',
        label: 'Class / program',
        done: filled(row?.student_grade_or_program),
      },
      {
        id: 'goals',
        label: 'Learning goals',
        done: filled(row?.student_learning_goals),
      },
    )
  } else {
    items.push(
      {
        id: 'photo',
        label: 'Profile photo',
        done: Boolean(extras?.hasProfilePhoto),
      },
      {
        id: 'expertise',
        label: 'Subjects / expertise',
        done: filled(row?.mentor_expertise),
      },
      {
        id: 'experience',
        label: 'Years of experience',
        done: row?.mentor_experience_years != null && !Number.isNaN(row.mentor_experience_years),
      },
      {
        id: 'qualifications',
        label: 'Qualifications',
        done: filled(row?.mentor_qualifications),
      },
      {
        id: 'bio',
        label: 'Short bio',
        done: filled(row?.mentor_bio),
      },
    )
  }

  items.push({
    id: 'city',
    label: 'City (recommended)',
    done: filled(row?.city),
  })

  const complete = items.filter((i) => i.done).length
  const percent = items.length === 0 ? 0 : Math.round((complete / items.length) * 100)

  return { percent, items }
}
